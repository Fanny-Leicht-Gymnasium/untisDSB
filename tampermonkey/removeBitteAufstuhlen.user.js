// ==UserScript==
// @name         Remove Rows and Consecutive Separators
// @namespace    http://tampermonkey.net/
// @version      2024-11-28
// @description  Remove rows based on specific criteria and reduce consecutive separators to one on the WebUntis page
// @author       Mr-Comand
// @match        https://*.webuntis.com/WebUntis/monitor*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webuntis.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Declare a MutationObserver variable to handle DOM changes
    let observer;

    /**
     * Function to remove consecutive duplicate separator rows.
     * It ensures that only one separator row remains if multiple occur in sequence.
     */
    function removeConsecutiveSeparators() {
        // Select all rows matching the specified class and data attribute
        const separatorRows = document.querySelectorAll('tr.grupet_widget_ScrollableTable_separator[data-untis-separator="true"]');
        let previousRow = null; // Track the last processed separator row

        separatorRows.forEach(row => {
            // Check if the current row is immediately after the previous separator
            if (previousRow && row.previousElementSibling === previousRow) {
                row.remove(); // Remove the current row if it's a duplicate
            } else {
                previousRow = row; // Update the reference to the current row
            }
        });
    }

    /**
     * Function to remove rows based on specific criteria and update the list of classes with changes.
     * Also calls removeConsecutiveSeparators to clean up extra separator rows.
     */
    function removeRowsBasedOnCriteria() {
        // Select all rows in the table
        const rows = document.querySelectorAll('table tbody tr');

        // Temporarily disconnect the observer to avoid triggering it during DOM modifications
        observer.disconnect();
        // Array to keep track of unique classes with changes
        const classesWithChanges = [];
        // Iterate over each row
        rows.forEach(row => {
            const cells = row.querySelectorAll('td'); // Select all cells in the row

            // Check if the row has enough cells for our criteria
            if (cells.length > 1) {
                const vertretungstext = cells[8].innerText.trim(); // Extract Vertretungstext from the 9th cell
                const infoText = cells[7].innerText.trim(); // Extract Info text from the 8th cell
                const changeClass = cells[0].innerText.trim(); // Extract class name from the 1st cell

                // Check if the row matches the criteria for removal
                if (/^\W?bitte aufstuhlen!?\W?$/i.test(vertretungstext) && infoText.toLowerCase() === 'text') {
                    row.remove(); // Remove the row
                } else if (!classesWithChanges.includes(changeClass)) {
                    // Add unique class names to the list
                    classesWithChanges.push(changeClass);
                }
            }
        });

        // Update the list of classes with changes in the UI
        const classesWithChangesList = document.querySelector('#dijit__WidgetBase_1 > tr > td > span:nth-of-type(2)');
        if (classesWithChangesList) {
            classesWithChangesList.innerHTML = classesWithChanges.join(', '); // Display the updated list
        }

        // Remove consecutive duplicate separator rows
        removeConsecutiveSeparators();

        // Reconnect the observer after modifications
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // Run the row removal logic when the page loads
    window.addEventListener('load', removeRowsBasedOnCriteria);

    // Initialize the MutationObserver to monitor changes in the DOM
    observer = new MutationObserver(() => {
        removeRowsBasedOnCriteria(); // Call the function whenever the DOM changes
    });

    // Start observing the body for changes, including its child elements
    observer.observe(document.body, {
        childList: true, // Watch for added or removed child elements
        subtree: true,   // Include changes in all descendants
        characterData: true // Watch for changes in text content
    });
})();
