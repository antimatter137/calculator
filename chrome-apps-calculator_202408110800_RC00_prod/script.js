function scrollToBottomOnce() {
    const calcField1 = document.querySelector('.calc-display');
        if (calcField1) {
        calcField1.scrollTop = calcField1.scrollHeight;
    }
}


function setupCalculatorOverlay() {
    const checkInterval = setInterval(() => {
        const calcField = document.querySelector('.calculator-display');
        const toggleElement = document.querySelector('.rad.active');
        const calcField1 = document.querySelector('.calc-display');
        const clearButton = document.querySelector('.actionButtonCView.actionButtonCView-ac'); // Clear button

        if (calcField && toggleElement && clearButton) {
            clearInterval(checkInterval); // Stop checking once found

            setTimeout(() => {
                alert('To use the calculator: Click the Rad/Deg button in the upper left to go into AI mode. Then enter your math question. Press Enter to ask the AI. The AC button will clear your screen and pressing the Rad/Deg button again will return the calculator to its normal function. Do not use the calculator buttons while in AI mode.');
            }, 100);

// ${calcField.offsetHeight + 50}
//
            // Create an overlay element on top of the calculator display
            const overlay = document.createElement('div');
            overlay.style.height = `${calcField1.offsetHeight + 75}`;
            overlay.style.position = 'absolute';
            overlay.style.left = `${calcField.offsetLeft}px`;
            overlay.style.width = `${calcField.offsetWidth}px`;
            overlay.style.zIndex = '0';
            overlay.style.background = 'transparent';
            overlay.style.color = window.getComputedStyle(calcField).color;
            overlay.style.font = window.getComputedStyle(calcField).font;
            overlay.style.whiteSpace = 'pre-wrap';
            overlay.style.overflowY = 'auto'; // Allow vertical scrolling
            overlay.style.outline = 'none';
            overlay.style.userSelect = 'text'; // Allow text selection
            overlay.style.caretColor = 'transparent';
            overlay.contentEditable = false; // Allow content editing
            overlay.style.textAlign = 'left'; // Left-align text
            overlay.setAttribute('spellcheck', 'false');

            calcField.parentNode.appendChild(overlay);

            // Create an overlay on the toggle button
            const radOverlay = document.createElement('div');
            radOverlay.style.position = 'absolute';
            radOverlay.style.top = `${toggleElement.offsetTop}px`;
            radOverlay.style.left = `${toggleElement.offsetLeft}px`;
            radOverlay.style.width = `${toggleElement.offsetWidth}px`;
            radOverlay.style.height = `${toggleElement.offsetHeight}px`;
            radOverlay.style.zIndex = '1001';
            radOverlay.style.background = 'transparent';

            toggleElement.parentNode.appendChild(radOverlay);

            let isEditable = false;
            let currentInput = ''; // Variable to hold current input text

            radOverlay.addEventListener('click', () => {
                clearButton.click(); // Clear the calculator display
                isEditable = !isEditable;
                overlay.setAttribute('contenteditable', isEditable);
                overlay.focus();

                if (isEditable) {
                    overlay.innerHTML = ''; // Clear overlay if editable
                } else {
                    overlay.innerHTML = ''; // Clear the overlay text when stopping edit mode
                }
            });

            // Clear overlay text when the calculator clear button is pressed
            clearButton.addEventListener('click', () => {
                overlay.innerText = ''; // Clear the overlay text
                currentInput = ''; // Reset input variable
                overlay.focus(); // Automatically focus on the overlay for immediate typing
            });

overlay.addEventListener('keydown', function(event) {
    if (isEditable) {
        
        event.stopPropagation(); // Prevent keypresses from affecting the calculator
        scrollToBottomOnce();

        if (event.shiftKey && event.key === 'Enter') {
            event.preventDefault();
            currentInput += '\n'; // Add a newline character
            overlay.innerHTML = currentInput.replace(/\n/g, '<br>');
            overlay.scrollTop = overlay.scrollHeight;
            scrollToBottomOnce();
            return; 
        }
        // Handle Ctrl+C for copying selected text
        if (event.ctrlKey && event.key === 'c') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const selectedText = selection.toString();
                navigator.clipboard.writeText(selectedText);
                return;
            }
        }

        // Handle Ctrl+V for pasting text
        if (event.ctrlKey && event.key === 'v') {
            event.preventDefault(); // Prevent default paste behavior
            
            navigator.clipboard.readText().then(text => {
                // Always append the pasted text to the end of currentInput
                currentInput += text; // Append text directly to currentInput
                overlay.innerHTML = currentInput; // Update the overlay display
                
                // Move cursor to the end of the text
                setCursorPosition(overlay, currentInput.length);
                overlay.scrollTop = overlay.scrollHeight; // Scroll to the bottom
            }).catch(err => console.error('Error reading clipboard:', err));
            return;
        }

        // Handle Enter for AI submission
        if (event.key === 'Enter') {
            currentInput = currentInput.trim();
            if (currentInput) {
                overlay.innerHTML = '...Thinking...';
                callAI(currentInput, overlay);
                currentInput = '';
            } else {
                alert('Please enter a question for the AI!');
            }
        } else if (event.key.length === 1) {
            currentInput += event.key; // Append character
            overlay.innerHTML = currentInput; // Update overlay display
            overlay.scrollTop = overlay.scrollHeight;
            scrollToBottomOnce();
            event.preventDefault(); // Prevent calculator input
        }

        // Handle Backspace
        if (event.key === 'Backspace') {
            currentInput = currentInput.slice(0, -1); // Remove last character
            overlay.innerHTML = currentInput; // Update overlay display
            overlay.scrollTop = overlay.scrollHeight;
            event.preventDefault(); // Prevent calculator input
        }
    }
});

// Function to get the current selection start position
function getSelectionStart(element) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        return preCaretRange.toString().length;
    }
    return 0; // Default to 0 if no selection
}

// Function to get the current selection end position
function getSelectionEnd(element) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    }
    return 0; // Default to 0 if no selection
}

// Function to set the cursor position
function setCursorPosition(element, pos) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element); // Select the entire overlay content
    range.collapse(true); // Collapse the range to the end
    range.setStart(element, pos); // Set start to the end of the content

    sel.removeAllRanges(); // Clear any existing selections
    sel.addRange(range); // Add the new range to the selection
}


// Helper functions for getting selection start and end, and setting cursor position
function getSelectionStart(element) {
    const selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
}

function getSelectionEnd(element) {
    const selection = window.getSelection();
    let range = selection.getRangeAt(0);
    let preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
}

function setCursorPosition(element, position) {
    const range = document.createRange();
    const selection = window.getSelection();
    
    range.setStart(element.childNodes[0], position);
    range.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(range);
}


            // Find the .extended-tap-target element inside two shadow roots
            const shadowHost = document.querySelector('body > calculator-overflow-menu');
            const innerShadowHost = shadowHost.shadowRoot.querySelector('#more-options-button');
            const extendedTapTarget = innerShadowHost.shadowRoot.querySelector('.extended-tap-target');

            if (extendedTapTarget) {
                extendedTapTarget.addEventListener('click', () => {
                    setTimeout(() => {
                        alert('To use the calculator: Click the Rad/Deg button in the upper left to go into AI mode. Then enter your math question. Press Enter to ask the AI. The AC button will clear your screen and pressing the Rad/Deg button again will return the calculator to its normal function. Do not use the calculator buttons while in AI mode.');
                    }, 300);
                });
            } else {
                console.log('No elements found matching ".extended-tap-target".');
            }

        } else {
            console.log('Waiting for .calculator-display, .rad.active, or clear button...');
        }
    }, 500); // Check every 500ms
}
function callAI(question, overlay) {
    fetch("/.netlify/functions/callAI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    })
    .then(response => response.json())
    .then(data => {
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            overlay.innerHTML = data.candidates[0].content.parts[0].text;
            scrollToBottomOnce();
        } else {
            overlay.innerHTML = 'No response from AI.';
            scrollToBottomOnce();
        }
    })
    .catch(error => {
        console.error('Error fetching AI response:', error);
        overlay.innerHTML = 'Error fetching AI response.';
        scrollToBottomOnce();
    });
}


setupCalculatorOverlay();
