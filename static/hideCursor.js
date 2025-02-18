let cursorTimeout;

function hideCursor() {
    document.body.classList.add("hide-cursor");
}


function resetCursorTimer() {
    clearTimeout(cursorTimeout);
    document.body.classList.remove("hide-cursor");
    cursorTimeout = setTimeout(hideCursor, 1000); // Hide cursor after 1 seconds
}

document.addEventListener("mousemove", resetCursorTimer);
document.addEventListener("keydown", resetCursorTimer);

resetCursorTimer(); // Start the timer on load