const commandName = '_execute_browser_action';
/* selectors */
const shortcutElem = document.querySelector('#shortcut');
const resetElem = document.querySelector('#reset')
const updatedMessage = document.querySelector("#updatedMessage");
const errorMessage = document.querySelector("#errorMessage");

const openCurrentWindowElem = document.querySelector('#openCurrentWindow');

/**
 * Update the UI
 */
async function updateUI() {
    let commands = await browser.commands.getAll();
    for (command of commands) {
        if (command.name === commandName) {
            shortcutElem.value = command.shortcut;
        }
    }
    // Load openCurrentWindow option from sync storage
    const { openCurrentWindow } = await browser.storage.sync.get('openCurrentWindow');
    openCurrentWindowElem.checked = !!openCurrentWindow;
}

/**
 * Show (and hide) a message
 */
async function showMessage(elem) {
    elem.classList.replace("hidden", "shown");
    setTimeout(function () { elem.classList.replace("shown", "hidden"); }, 5000);
}

/**
 * Show and hide a message when the changes are saved
 */
async function msgUpdated() {
    showMessage(updatedMessage);
}

/**
 * Show an error message when the shortcut entered is invalid
 */
async function msgError() {
    showMessage(errorMessage);
}

/**
 * Update the shortcut based on the value in the textbox.
 */
async function updateShortcut() {
    if (endCaptureShortcut()) {
        await browser.commands.update({
            name: commandName,
            shortcut: shortcutElem.value
        });
        msgUpdated();
    } else {
        msgError();
    }
    updateUI();
    shortcutElem.blur();
}

/**
 * Reset the shortcut and update the textbox.
 */
async function resetShortcut() {
    await browser.commands.reset(commandName);
    updateUI();
    msgUpdated();
};

/**
 * Save the openCurrentWindow option
 */
async function saveOpenCurrentWindow() {
    await browser.storage.sync.set({ openCurrentWindow: openCurrentWindowElem.checked });
    msgUpdated();
}

/**
 * Update the UI when the page loads.
 */
document.addEventListener('DOMContentLoaded', updateUI);

/**
 * Handle update and reset button clicks
 */
shortcutElem.addEventListener('focus', startCapturing);
shortcutElem.addEventListener('keydown', captureKey);
shortcutElem.addEventListener('keyup', updateShortcut);
resetElem.addEventListener('click', resetShortcut);

openCurrentWindowElem.addEventListener('change', saveOpenCurrentWindow);