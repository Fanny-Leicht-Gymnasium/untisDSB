package nextcloud

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
)

type multistatus struct {
	Responses []response `xml:"response"`
}

type response struct {
	Href string `xml:"href"`
	Prop prop   `xml:"propstat>prop"`
}

type prop struct {
	ResourceType resourceType `xml:"resourcetype"`
}

type resourceType struct {
	Collection *struct{} `xml:"collection"`
}

// GetNextcloudImages returns all file URLs from a public Nextcloud share.
func GetNextcloudImages(shareURL string, nextcloudDepth int) ([]string, error) {
	base, token, dir, err := parseShareURL(shareURL)
	if err != nil {
		return nil, err
	}

	webdavURL := fmt.Sprintf("%s/public.php/dav/files/%s/", base, token)

	if dir != "" {
		webdavURL = strings.TrimRight(webdavURL, "/") + "/" + url.PathEscape(dir) + "/"
	}

	req, err := http.NewRequest("PROPFIND", webdavURL, bytes.NewReader([]byte(`<?xml version="1.0"?>
<d:propfind xmlns:d="DAV:">
    <d:prop>
        <d:resourcetype/>
    </d:prop>
</d:propfind>`)))
	if err != nil {
		return nil, err
	}
	if nextcloudDepth > 0 {
		req.Header.Set("Depth", strconv.Itoa(nextcloudDepth))
	} else {
		req.Header.Set("Depth", "1")
	}
	req.Header.Set("Content-Type", "application/xml")
	req.Header.Set("X-Requested-With", "XMLHttpRequest")

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusMultiStatus {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("unexpected status %d: %s", resp.StatusCode, body)
	}

	var ms multistatus
	if err := xml.NewDecoder(resp.Body).Decode(&ms); err != nil {
		return nil, err
	}

	var urls []string

	for _, r := range ms.Responses {
		// Skip the root directory itself.
		rootPath := "/public.php/dav/files/" + token + "/"
		if dir != "" {
			rootPath += dir + "/"
		}

		if strings.TrimRight(r.Href, "/") == strings.TrimRight(rootPath, "/") {
			continue
		}

		// Skip directories.
		if r.Prop.ResourceType.Collection != nil {
			continue
		}

		href, err := url.PathUnescape(r.Href)
		if err != nil {
			href = r.Href
		}

		prefix := "/public.php/dav/files/" + token + "/"

		relative := strings.TrimPrefix(href, prefix)
		// Skip unsupported files.
		if !isSupportedFile(relative) {
			continue
		}

		downloadURL := fmt.Sprintf("%s/public.php/dav/files/%s/%s",
			base,
			token,
			url.PathEscape(relative),
		)

		urls = append(urls, downloadURL)
	}

	return urls, nil
}

func isSupportedFile(path string) bool {
	switch strings.ToLower(filepath.Ext(path)) {
	case ".bmp", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".tif", ".tiff", ".webp":
		return true
	default:
		return false
	}
}

func parseShareURL(shareURL string) (base string, token string, dir string, err error) {
	u, err := url.Parse(shareURL)
	if err != nil {
		return "", "", "", err
	}

	// Validate scheme.
	if u.Scheme != "https" {
		return "", "", "", fmt.Errorf("only HTTPS URLs are allowed")
	}

	// Extract share token.
	parts := strings.Split(strings.Trim(u.Path, "/"), "/")

	if len(parts) != 2 || parts[0] != "s" {
		return "", "", "", fmt.Errorf("invalid Nextcloud share URL")
	}

	token = parts[1]

	if token == "" {
		return "", "", "", fmt.Errorf("missing share token")
	}

	// Extract optional folder.
	dir = u.Query().Get("dir")

	if dir != "" {
		// Normalize folder path.
		dir = strings.TrimPrefix(dir, "/")

		// Prevent traversal.
		if strings.Contains(dir, "..") {
			return "", "", "", fmt.Errorf("invalid directory path")
		}
	}

	base = u.Scheme + "://" + u.Host

	return base, token, dir, nil
}
