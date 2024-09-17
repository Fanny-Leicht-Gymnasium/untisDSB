package main

import (
	"embed"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/Fanny-Leicht-Gymnasium/untisDSB/config"
)

//go:embed static/*
var staticFiles embed.FS

//go:embed index.html
var indexHTML string

func main() {
	err := config.LoadConfig()
	if err != nil {
		panic(err)
	}
	go config.WatchConfig(config.ConfigPath) // Start watching for changes

	// Serve static files (like CSS, JS, images) from the "static" directory
	http.Handle("/static/", http.FileServer(http.FS(staticFiles)))

	// Serve HTML page
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(indexHTML))
	})

	// Serve the URLs for Untis
	http.HandleFunc("/untis/urls", func(w http.ResponseWriter, r *http.Request) {
		// Create a response structure with URLs
		urls := map[string]string{
			"today":    config.Config.Untis.TodayURL,
			"tomorrow": config.Config.Untis.TomorrowURL,
		}
		// Set response header and encode URLs to JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(urls); err != nil {
			http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		}
	})

	// Serve file URLs in the advertisement path at /ad/urls
	http.HandleFunc("/ad", func(w http.ResponseWriter, r *http.Request) {
		dirPath := config.Config.Advertisement.Path

		// Read all files in the directory
		files, err := ioutil.ReadDir(dirPath)
		if err != nil {
			http.Error(w, "Error reading directory", http.StatusInternalServerError)
			return
		}

		// Create a list of URLs for the files
		var fileUrls []string
		for _, file := range files {
			if !file.IsDir() {
				// Generate the URL path for each file
				fileUrl := "/ad/" + filepath.Base(file.Name())
				fileUrls = append(fileUrls, fileUrl)
			}
		}
		res := struct {
			Urls          []string `json:"urls"`
			SwitchingTime uint     `json:"switchingTime"`
			RefetchTime   uint     `json:"refetchTime"`
		}{
			Urls:          fileUrls,
			SwitchingTime: config.Config.Advertisement.SwitchingTime,
			RefetchTime:   config.Config.Advertisement.RefetchTime,
		}

		// Set response header and encode URLs to JSON
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(res); err != nil {
			http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
		}
	})

	// Serve files from the advertisement directory
	http.Handle("/ad/", http.StripPrefix("/ad/", http.FileServer(http.Dir(config.Config.Advertisement.Path))))
	http.HandleFunc("/scrolling-text", func(w http.ResponseWriter, r *http.Request) {
		var texts []string
		texts = config.Config.ScrollText.Texts
		if texts == nil {
			texts = []string{}
		}
		if config.Config.ScrollText.Path != "" {
			file, err := os.ReadFile(config.Config.ScrollText.Path)
			if err != nil {
				log.Printf("Error reading scrolling text file: %v", err)
			} else {
				for _, line := range strings.Split(string(file), "\n") {
					line = strings.TrimSpace(line) // Trim spaces or newlines
					if line != "" {
						texts = append(texts, line)
					}
				}
			}
		}
		res := struct {
			Texts       []string `json:"texts"`
			RefetchTime uint     `json:"refetchTime"`
		}{
			Texts:       texts,
			RefetchTime: config.Config.ScrollText.RefetchTime,
		}
		json.NewEncoder(w).Encode(res)
	})

	// Start the server
	log.Printf("Server starting on %s...", config.Config.WebServer.ServerAddress)
	err = http.ListenAndServe(config.Config.WebServer.ServerAddress, nil)
	if err != nil {
		log.Fatalf("Error starting server: %v", err)
	}

}
