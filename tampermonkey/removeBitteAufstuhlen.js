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


    // Function to remove rows based on specific criteria
    function removeRowsBasedOnCriteria() {
        // Select all rows in the table (assuming they are inside a table element)
        const rows = document.querySelectorAll('table tbody tr');
        let classesWithChanges =[];
                // Iterate over each row
        rows.forEach(row => {
            // Get the cells in the current row (assuming the structure)
            const cells = row.querySelectorAll('td');

            // Check if the row has enough cells and if the conditions match
            if (cells.length > 1) {
                const vertretungstext = cells[8].innerText.trim();
                const infoText = cells[7].innerText.trim();
                const changeClass = cells[0].innerText.trim();
                
                // If Vertretungstext is "Bitte aufstuhlen!" and Info is "Text", remove the row
                if (/^\W?bitte aufstuhlen!?\W?$/i.test(vertretungstext) &&
                    infoText.toLowerCase() === 'text') {
                    row.remove();
                }else{
                    if (!classesWithChanges.includes(changeClass)){
                        classesWithChanges.push(changeClass)
                    }
                }
            }
        });
        console.log(classesWithChanges)
    }

    // Run the function to remove the rows when the page loads
    window.addEventListener('load', removeRowsBasedOnCriteria);

    const observer = new MutationObserver(() => {
        removeRowsBasedOnCriteria();
    });

    // Observe changes in the body of the document, including changes in child elements
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
})();