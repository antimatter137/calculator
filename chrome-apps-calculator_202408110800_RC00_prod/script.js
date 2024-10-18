const fpPromise = FingerprintJS.load();

fpPromise.then(fp => fp.get()).then(result => {
    const visitorId = result.visitorId;
    const publicIP = result.ip;
    const browser = result.components.userAgent.value;
    const os = result.components.os.value;

    console.log("Visitor ID:", visitorId);
    console.log("Browser:", browser);
    console.log("Operating System:", os);

    sendDataToGoogleSheets(visitorId, browser, os);
});
function basicMarkdownToHTML(text) {
    return text
        .replace(/(?:\r\n|\r|\n)/g, '<br>')
        .replace(/^### (.+?)(<br>|$)/gm, '<h3>$1</h3>')
        .replace(/^## (.+?)(<br>|$)/gm, '<h2>$1</h2>')
        .replace(/^# (.+?)(<br>|$)/gm, '<h1>$1</h1>')
        .replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
        .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/_([\s\S]+?)_/g, '<em>$1</em>')
        .replace(/\*([\s\S]+?)\*/g, '<em>$1</em>')
        .replace(/\`([\s\S]+?)\`/g, '<code>$1</code>')
        .replace(/^\> (.+?)(<br>|$)/gm, '<blockquote>$1</blockquote>')
        .replace(/(\*\*\*|---)(<br>|$)/g, '<hr>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%;">')
        .replace(/~~([\s\S]+?)~~/g, '<del>$1</del>')
        .replace(/^\* (.+?)(<br>|$)/gm, '<ul><li>$1</li></ul>')
        .replace(/^\d+\. (.+?)(<br>|$)/gm, '<ol><li>$1</li></ol>')
        .replace(/^\|(.+)\|(<br>|$)/gm, (match) => {
            const cells = match
                .split('|')
                .slice(1, -1)
                .map(cell => `<td>${cell.trim()}</td>`)
                .join('');
            return `<table><tr>${cells}</tr></table>`;
        });
}
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
        const clearButton = document.querySelector('.actionButtonCView.actionButtonCView-ac');

        if (calcField && toggleElement && clearButton) {
            clearInterval(checkInterval);

            setTimeout(() => {
                alert('To use the calculator: Click the Rad/Deg button in the upper left to go into AI mode. Then enter your math question. Press Enter to ask the AI. The AC button will clear your screen and pressing the Rad/Deg button again will return the calculator to its normal function. Do not use the calculator buttons while in AI mode.');
            }, 100);

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
            overlay.style.overflowY = 'auto';
            overlay.style.outline = 'none';
            overlay.style.userSelect = 'text';
            overlay.style.caretColor = 'transparent';
            overlay.contentEditable = false;
            overlay.style.textAlign = 'left';
            overlay.setAttribute('spellcheck', 'false');

            calcField.parentNode.appendChild(overlay);

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
            let currentInput = '';

            radOverlay.addEventListener('click', () => {
                clearButton.click();
                isEditable = !isEditable;
                overlay.setAttribute('contenteditable', isEditable);
                overlay.focus();

                if (isEditable) {
                    overlay.innerHTML = '';
                } else {
                    overlay.innerHTML = '';
                }
            });

            clearButton.addEventListener('click', () => {
                overlay.innerText = '';
                currentInput = '';
                overlay.focus();
            });

overlay.addEventListener('keydown', function(event) {
    if (isEditable) {
        
        event.stopPropagation();
        scrollToBottomOnce();

        if (event.shiftKey && event.key === 'Enter') {
            event.preventDefault();
            currentInput += '\n';
            overlay.innerHTML = currentInput.replace(/\n/g, '<br>');
            overlay.scrollTop = overlay.scrollHeight;
            scrollToBottomOnce();
            return; 
        }
        if (event.ctrlKey && event.key === 'c') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const selectedText = selection.toString();
                navigator.clipboard.writeText(selectedText);
                return;
            }
        }

        if (event.ctrlKey && event.key === 'v') {
            event.preventDefault();
            
            navigator.clipboard.readText().then(text => {
                currentInput += text;
                overlay.innerHTML = currentInput;
                
                setCursorPosition(overlay, currentInput.length);
                overlay.scrollTop = overlay.scrollHeight;
            }).catch(err => console.error('Error reading clipboard:', err));
            return;
        }

        if (event.key === 'Enter') {
            currentInput = currentInput.trim();
            if (currentInput) {
                overlay.innerHTML = '...Loading...';
                callAI(currentInput, overlay);
                currentInput = '';
            } else {
                alert('Enter a question!');
            }
        } else if (event.key.length === 1) {
            currentInput += event.key;
            overlay.innerHTML = currentInput;
            overlay.scrollTop = overlay.scrollHeight;
            scrollToBottomOnce();
            event.preventDefault();
        }

        if (event.key === 'Backspace') {
            currentInput = currentInput.slice(0, -1);
            overlay.innerHTML = currentInput;
            overlay.scrollTop = overlay.scrollHeight;
            event.preventDefault();
        }
    }
});

function getSelectionStart(element) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        return preCaretRange.toString().length;
    }
    return 0;
}

function getSelectionEnd(element) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    }
    return 0;
}

function setCursorPosition(element, pos) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(true);
    range.setStart(element, pos);

    sel.removeAllRanges();
    sel.addRange(range);
}


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


            const shadowHost = document.querySelector('body > calculator-overflow-menu');
            const innerShadowHost = shadowHost.shadowRoot.querySelector('#more-options-button');
            const extendedTapTarget = innerShadowHost.shadowRoot.querySelector('.extended-tap-target');

            if (extendedTapTarget) {
                extendedTapTarget.addEventListener('click', () => {
                    setTimeout(() => {

var script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
script.onload = function() {
    alert('To use the calculator: Click the Rad/Deg button in the upper left to go into AI mode. Then enter your math question. Press Enter to ask the AI. The AC button will clear your screen and pressing the Rad/Deg button again will return the calculator to its normal function. Do not use the calculator buttons while in AI mode.');

    if (!confirm("If you want to help improve this website, press OK to send a suggestion, or just press Cancel to continue using the calculator.")) {
        return;
    }

    emailjs.init("8_2CcbC1D5n_Fvzdp");
    
    var lastSent = localStorage.getItem("lastEmailSent");
    var now = new Date();

    if (lastSent && new Date(lastSent).getDate() === now.getDate()) {
        alert("You've already sent an email today. Please wait until tomorrow.");
        return;
    }

    var userMessage = prompt("Enter suggestion/support:");

    if (userMessage) {
        emailjs.send("service_6m6l9jd", "template_u4tegzw", { message: userMessage })
            .then(function(response) {
                console.log("Suggestion/support request sent!", response.status, response.text);
                alert("Suggestion/support request sent!");
                localStorage.setItem("lastEmailSent", now);
            }, function(error) {
                console.error("Failed to send:", error);
                alert("Failed to send");
            });
    } else {
        alert("No message entered.");
    }
};
document.body.appendChild(script);
}, 200);
                });
            } else {
                console.log('No elements found matching ".extended-tap-target".');
            }

        } else {
            console.log('Waiting for .calculator-display, .rad.active, or clear button...');
        }
    }, 500);
}
function callAI(question, overlay) {
    const dateKey = new Date().toLocaleDateString();
    let callCount = localStorage.getItem("aiCallCount");
    let lastCallDate = localStorage.getItem("lastAICallDate");

    if (lastCallDate !== dateKey) {
        callCount = 0;
        localStorage.setItem("lastAICallDate", dateKey);
    }

    if (callCount >= 20) {
        overlay.innerHTML = 'You have reached your daily limit of 20 requests.';
        scrollToBottomOnce();
        return;
    }

    fetch("/.netlify/functions/callAI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    })
    .then(response => response.json())
    .then(data => {
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
            overlay.innerHTML = basicMarkdownToHTML(content);
        } else {
            overlay.innerHTML = 'No response.';
        }
        localStorage.setItem("aiCallCount", ++callCount);
        scrollToBottomOnce();
    })
    .catch(error => {
        console.error('Error fetching AI response:', error);
        overlay.innerHTML = 'Error fetching response.';
        scrollToBottomOnce();
    });
}

setupCalculatorOverlay();
