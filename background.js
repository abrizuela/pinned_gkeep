const BASE_URL = "keep.google.com";
let state = {
    currentTabId: null,
    currentWinId: null,
    previousTab: null,
    previousWin: null
};

function logTabs(tabs) {
    console.log("Found tabs:", tabs.map(tab => tab.url));
}

async function getUserOption() {
    // If you want to use sync/local storage for user options, update here
    const { openCurrentWindow } = await browser.storage.sync.get('openCurrentWindow');
    return typeof openCurrentWindow === 'undefined' ? false : openCurrentWindow;
}

async function queryKeepTabs() {
    // Remove currentWindow filter if option is false
    const currentWindowSetting = await getUserOption();
    const queryObj = { url: `*://${BASE_URL}/*` };
    if (currentWindowSetting) {
        queryObj.currentWindow = true;
    }
    const tabs = await browser.tabs.query(queryObj);
    logTabs(tabs);
    return tabs;
}

function onError(e) {
    console.error("***Error: ", e);
}

function setButtonIcon(imageURL) {
    browser.browserAction.setIcon({ path: imageURL }).catch(onError);
}

function createPinnedTab() {
    browser.tabs.create({
        url: `https://${BASE_URL}`,
        pinned: true,
        active: true
    }).catch(onError);
}

async function handleSearch(webpageTabs) {
    if (webpageTabs.length > 0) {
        const tab = webpageTabs[0];
        if (tab.id === state.currentTabId) {
            // Already in Keep tab, go back to previous
            if (state.previousWin && state.previousTab) {
                await browser.windows.update(state.previousWin, { focused: true });
                await browser.tabs.update(state.previousTab, { active: true });
            }
        } else {
            // Switch to Keep tab
            state.previousTab = state.currentTabId;
            state.previousWin = state.currentWinId;
            await browser.windows.update(tab.windowId, { focused: true });
            await browser.tabs.update(tab.id, { active: true });
        }
        setButtonIcon(tab.favIconUrl);
    } else {
        // No Keep tab, create one
        state.previousTab = state.currentTabId;
        createPinnedTab();
    }
}

async function handleClick(tab) {
    state.currentTabId = tab.id;
    state.currentWinId = tab.windowId;
    try {
        const webpageTabs = await queryKeepTabs();
        await handleSearch(webpageTabs);
    } catch (e) {
        onError(e);
    }
}

function handleInstall(details) {
    if (details.reason === "install" || details.reason === "update") {
        browser.runtime.openOptionsPage();
    }
}

browser.browserAction.onClicked.addListener(handleClick);
browser.runtime.onInstalled.addListener(handleInstall);