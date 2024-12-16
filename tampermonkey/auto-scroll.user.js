// ==UserScript==
// @name         Rewritten smooth Auto Scroll.
// @namespace    http://tampermonkey.net/
// @version      2024-11-27
// @description  Smoothly auto-scroll the specific div on WebUntis page and makes it responsive to size changes.
// @author       Mr-Comand
// @match        https://*.webuntis.com/WebUntis/monitor*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webuntis.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const scrollIntervalTime = 5000
    const jumpToTop = false
    const inMotionPercentage = 0.01
    const overlapPercentage = 0.02

    // Function to adjust the height of an element to fit its parent
    function adjustElementHeight(selector) {
        const targetElement = document.querySelector(selector);
        if (!targetElement) {
            console.error(`${selector} not found`);
            return;
        }

        const parentElement = targetElement.parentElement;
        if (!parentElement) {
            console.error(`Parent of ${selector} not found`);
            return;
        }

        // Calculate the available height by subtracting siblings' heights from the parent height
        const parentHeight = parentElement.clientHeight;
        const siblingHeight = Array.from(parentElement.children)
            .filter((child) => child !== targetElement)
            .reduce((total, sibling) => total + sibling.offsetHeight, 0);

        const availableHeight = Math.max(0, parentHeight - siblingHeight);
        targetElement.style.height = `${availableHeight}px`;
        targetElement.style.overflowY = 'auto'; // Allow scrolling if needed
        console.log(`Adjusted ${selector} to ${availableHeight}px`);
    }

    // Adjust parent containers to take up full viewport size
    function adjustParentContainers() {
        const topLevelContainer = document.querySelector('body > div:nth-of-type(2)');
        if (topLevelContainer) {
            topLevelContainer.style.width = '100vw';
            topLevelContainer.style.height = '100vh';
        }

        const childContainer = document.querySelector('body > div > div:first-of-type');
        if (childContainer) {
            childContainer.style.width = '100%';
            childContainer.style.height = '100%';
        }
    }

    // Main function to adjust all relevant elements
    function adjustHeights() {
        adjustParentContainers();
        adjustElementHeight('#uniqName_15_0');
        adjustElementHeight('#uniqName_15_0 > div:has(table > tbody)');
    }

    function fixScrolling() {
        const tableDivs = document.querySelectorAll('#uniqName_15_0>div:has(table>tbody)');
        tableDivs.forEach(div => {
            const table = div.querySelector('table'); // Check if the div contains a table with a tbody
            if (table) {
                // Apply the required styles
                div.style.overflowY = "auto"; // Allow scrolling within the div
                table.style.removeProperty("overflow");
                table.style.removeProperty("position");
                adjustHeights();
            }
        });
    }


    // Wait for the DOM to be fully loaded
    window.addEventListener('load', function () {
        function smoothScrollPageDown() {
            // Select the specific div
            const tableDiv = document.querySelectorAll('#uniqName_15_0 > div')[1];

            if (!tableDiv) {
                console.error("Specified div not found.");
                return;
            }

            // Ensure the div is scrollable
            if (tableDiv.scrollHeight > tableDiv.clientHeight) {
                let scrolling = false;
                let scrollInterval = undefined;
                setInterval(() => {
                    console.log("scroll")
                    if (tableDiv.scrollTop >= tableDiv.scrollHeight - tableDiv.clientHeight) {
                        clearInterval(scrollInterval);
                        if (jumpToTop || inMotionPercentage == 0) {
                            tableDiv.scrollTop = 0; // Reset to the top
                        } else {
                            scrolling = true;
                            // Start smooth scrolling by small increments
                            const scrollHeight = tableDiv.scrollHeight; // Visible height of the div
                            const step = scrollHeight / (inMotionPercentage * scrollIntervalTime); // Small scroll step in pixels
                            const interval = 1; // Time in ms between each scroll step
                            const totalSteps = tableDiv.scrollHeight / step; // Number of steps to scroll one viewport height

                            let steps = 0;
                            scrollInterval = setInterval(() => {
                                const currentScroll = tableDiv.scrollTop;
                                const newScroll = currentScroll - step;

                                // reset to the top if at the bottom
                                if (steps >= totalSteps) {
                                    clearInterval(scrollInterval);
                                    scrolling = false;
                                } else {
                                    tableDiv.scrollTop = newScroll;
                                    steps++;
                                }
                            }, interval);
                        }
                        scrolling = false
                    } else if (!scrolling) {
                        scrolling = true;
                        // Start smooth scrolling by small increments
                        const viewportHeight = tableDiv.clientHeight * (1 - overlapPercentage); // Visible height of the div
                        const step = viewportHeight / (inMotionPercentage * scrollIntervalTime); // Small scroll step in pixels
                        const interval = 1; // Time in ms between each scroll step
                        const totalSteps = viewportHeight / step; // Number of steps to scroll one viewport height

                        if (inMotionPercentage == 0) {
                            clearInterval(scrollInterval);
                            tableDiv.scrollTop = tableDiv.scrollTop + viewportHeight;
                        } else {
                            let steps = 0;
                            clearInterval(scrollInterval);
                            scrollInterval = setInterval(() => {
                                const currentScroll = tableDiv.scrollTop;
                                const newScroll = currentScroll + step;

                                // reset to the top if at the bottom
                                if (steps >= totalSteps) {
                                    clearInterval(scrollInterval);
                                    scrolling = false;
                                } else {
                                    tableDiv.scrollTop = newScroll;
                                    steps++;
                                }
                            }, interval);
                        }
                    }
                }, scrollIntervalTime); // Trigger every 5 seconds
            } else {
                console.warn("The selected div is not scrollable.");
            }
        }

        // Call the smooth scroll function
        smoothScrollPageDown();
    });

    const observer = new MutationObserver(() => {
        fixScrolling();
        adjustHeights();
    });
    let lastDevicePixelRatio = window.devicePixelRatio;
    function detectZoom() {
        if (window.devicePixelRatio !== lastDevicePixelRatio) {
            lastDevicePixelRatio = window.devicePixelRatio;
            console.log('Zoom detected. Adjusting heights.');
            adjustHeights();
        }
    }

    setInterval(detectZoom, 200);
    window.addEventListener('resize', adjustHeights);

    // Observe changes in the body of the document, including changes in child elements
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
})();
