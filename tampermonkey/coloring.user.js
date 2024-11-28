// ==UserScript==
// @name         Highlight Rows by Stufe and Subgroup
// @namespace    http://tampermonkey.net/
// @version      2024-11-28
// @description  Highlight rows based on grade level (Stufe) and subgroup (a, b, c, d), with improved text readability, including strikethrough text.
// @author       Mr-Comand
// @match        https://*.webuntis.com/WebUntis/monitor*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webuntis.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Mapping of Stufe to hue values (Color coding grades)
    const hueMap = {
        '5': 0,    // Red
        '6': 30,   // Orange
        '7': 50,   // Yellow
        '8': 100,  // Lime Green
        '9': 180,  // Cyan
        '10': 240, // Blue
        '11': 280, // Violet
        '12': 300  // Purple
    };

    // Mapping of subgroup to saturation levels (Color intensity)
    const saturationMap = {
        'a': 40,  // Light saturation
        'b': 70,  // High saturation
        'c': 50,  // Medium saturation
        'd': 60,  // High saturation
        '11': 60, // Standard saturation
        '12': 60  // Standard saturation
    };

    /**
     * Get color based on Stufe (grade) and subgroup.
     * @param {string} stufe - The grade level and subgroup (e.g., '5a', '6b').
     * @returns {string} - The color in HSL format.
     */
    function getColor(stufe) {
        // Match the grade (Stufe) and subgroup from the stufe string
        const stufeMatch = stufe.match(/^(5|6|7|8|9|10|11|12)/); // Match grade level
        const subgroupMatch = stufe.match(/(a|b|c|d|11|12)$/); // Match subgroup

        // Default hue if no grade match, default saturation if no subgroup match
        const hue = hueMap[stufeMatch?.[0]] || 0;
        const saturation = saturationMap[subgroupMatch?.[0]] || 50;

        // Return the color in HSL format
        return `hsl(${hue}, ${saturation}%, ${100 - saturation}%)`;
    }

    /**
     * Apply background colors to table rows based on their grade level and subgroup.
     */
    function applyRowHighlighting() {
        // Select all tables within the specific widget
        const tables = document.querySelectorAll('.grupet_widget_ScrollableTable table');

        // Loop through each table and process its rows
        tables.forEach(table => {
            const rows = table.querySelectorAll('table :not(thead) tr');

            // Loop through each row in the table
            rows.forEach(row => {
                const firstCell = row.querySelector('td, th'); // Get the first cell in the row
                if (firstCell) {
                    const stufe = firstCell.textContent.trim(); // Get the grade level and subgroup
                    const color = getColor(stufe); // Get the color for this grade and subgroup

                    // Apply the calculated color as the row's background
                    row.style.backgroundColor = color;

                    // Improve text readability
                    row.style.color = 'white'; // Set text color to white for contrast
                    row.style.fontWeight = 'bold'; // Make text bold for better visibility
                    row.style.textShadow = '3px 3px 10px rgba(0, 0, 0, 1)'; // Subtle text shadow for better contrast
                    row.style.padding = '5px'; // Add padding for better spacing

                    // Check if any text has a line-through decoration
                    const textElements = row.querySelectorAll('td, th');
                    textElements.forEach(element => {
                        if (window.getComputedStyle(element).textDecorationLine === 'line-through') {
                            // Apply styles to make line-through text more readable
                            element.style.textDecorationColor = 'red'; // Change the strikethrough color to white for contrast
                            element.style.textDecorationThickness = '3px'; // Make the strikethrough thicker
                            element.style.textShadow = '3px 3px 10px rgba(0, 0, 0, 1)'; // Darker text shadow to make strikethrough more visible
                        }
                    });
                }
            });
        });
    }

    // Initially apply row highlighting when the script runs
    applyRowHighlighting();

    // Set up a MutationObserver to apply the highlighting if the table content changes dynamically
    const observer = new MutationObserver(() => {
        applyRowHighlighting();
    });

    // Observe changes in the body of the document, including changes in child elements
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    console.log('Stufe and subgroup highlighter script with improved text readability (including strikethrough) is running...');
})();
