
// Function to calculate available height
function calculateAvailableHeight() {
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
    console.log(availableHeight)
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
var refetchTime = 60
var reloadIframeOnSizeChange = false
document.addEventListener('DOMContentLoaded', function () {
    const imgElement = document.getElementById('advertisement-image');
    let fileUrls = [];
    let currentIndex = 0;
    let switchingTime = 10; // Default switching time
    let updateInterval;
    imgElement.onload = function () {
        document.getElementById("iframe2").style.height = calculateAvailableHeight() + 5 + "px"
        reloadIframe("iframe2")
    }
    imgElement.addEventListener('error', function () {
        document.getElementById("bottom-right").style.display = "none"
        document.getElementById("iframe2").style.height = "100vh"
        reloadIframe("iframe2")
        fetchAndUpdateData()
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
        imgElement.src = fileUrls[currentIndex];
    }

    function fetchAndUpdateData() {
        fetch('/ad')
            .then(response => response.json())
            .then(data => {
                fileUrls = data.urls || []; // Update file URLs
                switchingTime = data.switchingTime || 10; // Update switching time
                refetchTime = data.refetchTime || 60;
                reloadIframeOnSizeChange = data.reloadIframeOnSizeChange || false;
                console.log(data.refetchTime)
                currentIndex = 0; // Reset index to start from the first image
                showNextImage(); // Show the first image immediately

                // Clear the existing interval if any
                if (updateInterval) {
                    clearInterval(updateInterval);
                }

                // Set a new interval with the updated switching time
                updateInterval = setInterval(showNextImage, switchingTime * 1000);
            })
            .catch(error => {
                console.error('Error fetching file URLs:', error);
            });
    }

    // Fetch data initially
    fetchAndUpdateData();

    // Fetch data at regular intervals
    setInterval(fetchAndUpdateData, refetchTime * 1000); // Update every 60 seconds
});
