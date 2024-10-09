
function adjustIframeHeight(iframeElement) {
    if (iframeElement && iframeElement.contentWindow) {
        const body = iframeElement.contentWindow.document.body;
        const html = iframeElement.contentWindow.document.documentElement;
        iframeElement.style.height = ""; // Add 20px for extra space
        const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        iframeElement.style.height = height + "px"; // Add 20px for extra space
    }
};

// Function to calculate available height
function calculateAvailableHeight() {
    if (fixedHight) {
        return window.innerHeight / 2
    }
    const bottomRightElement = document.getElementById("bottom-right");

    if (!bottomRightElement) {
        console.error('Element with id "bottom-right" not found');
        return;
    }

    // Get the height of the viewport (display height)
    const viewportHeight = window.innerHeight;

    // Get the height of the #bottom-right element
    const bottomRightHeight = bottomRightElement.offsetHeight;

    // Calculate the available height
    const availableHeight = viewportHeight - bottomRightHeight;
    return availableHeight;
}
function reloadIframe(iframeId) {
    if (!reloadIframeOnSizeChange) return;
    var iframe = document.getElementById(iframeId);
    if (iframe) {
        iframe.src = iframe.src; // Triggers a reload of the iframe
    } else {
        console.error(`Iframe with id "${iframeId}" not found.`);
    }
}
document.addEventListener('DOMContentLoaded', function () {
    // Fetch URLs from /untis/urls
    fetch('/untis/urls')
        .then(response => response.json())
        .then(urls => {
            // Check if the URLs object contains the expected keys
            if (urls.today && urls.tomorrow) {
                // Set the src attribute of the iframes with the fetched URLs
                document.getElementById('iframe1').src = urls.today;
                document.getElementById('iframe2').src = urls.tomorrow;
            } else {
                console.error('Invalid URLs data:', urls);
            }
        })
        .catch(error => {
            console.error('Error fetching URLs:', error);
        });

});
var adRefetchTime = 60
var reloadIframeOnSizeChange = false
var fixedHight = false
var adFullscreen = false
let adRefetchInterval
document.addEventListener('DOMContentLoaded', function () {
    const imageElement = document.getElementById("advertisement-image");
    const iframeElement = document.getElementById("advertisement-iframe");
    let fileUrls = [];
    let currentIndex = 0;
    let adSwitchingTime = 10; // Default switching time
    let adUpdateInterval;
    imageElement.onload = function () {
        if (!imageElement.checkVisibility()) {
            return
        }
        if (adFullscreen) {
            document.getElementById("iframe2").style.height = "100vh"
        }
        document.getElementById("iframe2").style.height = calculateAvailableHeight() + 5 + "px"
        reloadIframe("iframe2")
    }
    imageElement.addEventListener('error', function () {
        if (!imageElement.checkVisibility()) {
            return
        }
        document.getElementById("bottom-right").style.display = "none"
        document.getElementById("iframe2").style.height = "100vh"
        reloadIframe("iframe2")
        fetchAndUpdateAdData()
    });
    iframeElement.onload = function () {
        if (!iframeElement.checkVisibility()) {
            return
        }
        if (adFullscreen) {
            document.getElementById("iframe2").style.height = "100vh"
        }
        adjustIframeHeight(iframeElement)
        document.getElementById("iframe2").style.height = calculateAvailableHeight() + 5 + "px"
        reloadIframe("iframe2")
    }
    iframeElement.addEventListener('error', function () {
        if (!iframeElement.checkVisibility()) {
            return
        }

        document.getElementById("bottom-right").style.display = "none"
        document.getElementById("iframe2").style.height = "100vh"
        reloadIframe("iframe2")
        fetchAndUpdateAdData()
    });

    function showNextImage() {
        if (fileUrls.length === 0) {
            document.getElementById("bottom-right").style.display = "none"
            document.getElementById("iframe2").style.height = "100vh"
            return;
        } else {
            document.getElementById("bottom-right").style.display = ""
        }

        currentIndex = (currentIndex + 1) % fileUrls.length;
        const url = fileUrls[currentIndex];


        // Check if the URL is an HTML file
        if (url.endsWith('.html')) {
            // Display HTML file
            imageElement.style.display = 'none';
            iframeElement.style.display = '';
            iframeElement.src = url;
            imageElement.src = fileUrls[(currentIndex + 1) % fileUrls.length];
        } else {
            // Display image
            iframeElement.style.display = 'none';
            imageElement.style.display = '';
            imageElement.src = url;
            iframeElement.src = fileUrls[(currentIndex + 1) % fileUrls.length];
        }
    }

    function fetchAndUpdateAdData() {
        fetch('/ad')
            .then(response => response.json())
            .then(data => {
                fileUrls = data.urls || []; // Update file URLs
                var adSwitchingTimeNew = data.switchingTime || 10; // Update switching time
                adRefetchTime = data.refetchTime || 60;
                reloadIframeOnSizeChange = data.reloadIframeOnSizeChange || false;
                fixedHight = data.fixedHight || false;
                adFullscreen = data.fullscreen || false;
                if (fixedHight) {
                    document.body.classList.add('fixedHight');
                } else {
                    document.body.classList.remove('fixedHight');
                }
                if (adFullscreen) {
                    document.body.classList.add('adFullscreen');
                } else {
                    document.body.classList.remove('adFullscreen');
                }
                if (adSwitchingTimeNew != adSwitchingTime) {

                    adSwitchingTime = adSwitchingTimeNew
                    // Clear the existing interval if any
                    if (adUpdateInterval) {
                        clearInterval(adUpdateInterval);
                    }

                    // Set a new interval with the updated switching time
                    adUpdateInterval = setInterval(showNextImage, adSwitchingTime * 1000);

                }

                // Clear the existing interval if any
                if (adRefetchInterval) {
                    clearInterval(adRefetchInterval);
                }
                // Set a new interval with the updated switching time
                adRefetchInterval = setInterval(fetchAndUpdateAdData, adRefetchTime * 1000);

            })
            .catch(error => {
                console.error('Error fetching file URLs:', error);
            });
    }

    // Fetch data initially
    fetchAndUpdateAdData();
    showNextImage(); // Show the first image immediately
    adUpdateInterval = setInterval(showNextImage, adSwitchingTime * 1000);

});
