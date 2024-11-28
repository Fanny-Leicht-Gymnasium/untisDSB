// ==UserScript==
// @name         Remove Rows based on Vertretungstext and Info Criteria
// @namespace    http://tampermonkey.net/
// @version      2024-11-27
// @description  Remove rows where Vertretungstext is "Bitte aufstuhlen!" and Info is "Text" on the WebUntis page
// @author       Mr-Comand
// @match        https://*.webuntis.com/WebUntis/monitor*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webuntis.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let classesWithChanges = [];
    let observer;

    function removeRowsBasedOnCriteria() {
        // Select all rows in the table
        const rows = document.querySelectorAll('table tbody tr');
        classesWithChanges = [];
        // Disconnect observer to avoid loops during DOM modifications
        observer.disconnect();

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');

            if (cells.length > 1) {
                const vertretungstext = cells[8].innerText.trim();
                const infoText = cells[7].innerText.trim();
                const changeClass = cells[0].innerText.trim();

                // Remove rows based on criteria
                if (/^\W?bitte aufstuhlen!?\W?$/i.test(vertretungstext) &&
                    infoText.toLowerCase() === 'text') {
                    row.remove();
                } else if (!classesWithChanges.includes(changeClass)) {
                    classesWithChanges.push(changeClass);
                }
            }
        });
        // Update classesWithChanges list in the UI
        const classesWithChangesList = document.querySelector('#dijit__WidgetBase_1 > tr > td > span:nth-of-type(2)');
        if (classesWithChangesList) {
            classesWithChangesList.innerHTML = classesWithChanges.join(', ');
        }

        // Reconnect observer after modifications
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // Run the function on page load
    window.addEventListener('load', removeRowsBasedOnCriteria);

    // Initialize MutationObserver
    observer = new MutationObserver(() => {
        removeRowsBasedOnCriteria();
    });

    // Observe changes in the body of the document
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
})();
