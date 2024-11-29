const scrollTextElement = document.getElementById('scrolling-text');
var currentIndex = 0
var texts = []
var textComponents = [];
var scrollingTextRefetchTime = 60;
let scrollingTextRefetchInterval;
function newEleement(position) {

    // Create a new text component
    const newTextComponent = document.createElement('span');
    newTextComponent.className = 'scrolling-text-content';
    currentIndex = (currentIndex + 1) % texts.length; // Cycle through texts
    newTextComponent.textContent = texts[currentIndex];
    newTextComponent.style.position = 'absolute';
    newTextComponent.style.left = position + "px";

    // Add the new component to scrollTextElement
    scrollTextElement.appendChild(newTextComponent);

    // Update textComponents to include the new element
    textComponents = Array.from(scrollTextElement.querySelectorAll(".scrolling-text-content"));
}
function updateText() {
    if (texts.length > 0) {
        if (textComponents.length > 0) {

            scrollTextElement.style.display = ""
            textComponents.forEach(textComponent => {
                const currentLeft = parseInt(getComputedStyle(textComponent).left, 10);
                textComponent.style.left = (currentLeft - (window.innerWidth/70)) + "px";
                const textRect = textComponent.getBoundingClientRect();
                if (textRect.right < 0) {
                    textComponent.remove()
                    textComponents.splice(textComponents.indexOf(textComponent), 1)
                }

            });
            const lastTextComponent = textComponents[textComponents.length - 1];
            const lastTextRect = lastTextComponent.getBoundingClientRect();

            if (lastTextRect.right < window.innerWidth) {
                newEleement((lastTextRect.left) + (lastTextRect.width))
            }
        } else {
            newEleement(0)
        }

        // scrollTextElement.textContent = texts[currentIndex];
    } else {
        scrollTextElement.style.display = "none"
        scrollTextElement.childNodes.forEach(element => {
            element.remove();
        });
    }

}
document.addEventListener('DOMContentLoaded', function () {
    fetchAndUpdateData();
    // Initial update
    updateText();
    setInterval(updateText, 900);

});
function fetchAndUpdateData() {
    // Fetch scrolling text content from /scrolling-text
    fetch('/scrolling-text')
        .then(response => response.json())
        .then(data => {

            if (data.texts) {
                texts = data.texts
            }
            if (data.refetchTime){
                scrollingTextRefetchTime = data.refetchTime
            }
            textComponents = document.querySelectorAll(".scrolling-text-content");

            // Clear the existing interval if any
            if (scrollingTextRefetchInterval) {
                clearInterval(scrollingTextRefetchInterval);
            }
            scrollingTextRefetchInterval = setInterval(fetchAndUpdateData, scrollingTextRefetchTime * 1000);


        })
        .catch(error => {
            console.error('Error fetching scrolling text:', error);
        });
}
