let currentTabId;
let keepTabId;
let previousTab;

function onError(e) {
  console.log("***Error: " + e);
};

function createPinnedTab() {
  browser.tabs.create(
    {
      url: "https://keep.google.com",
      pinned: true,
      active: true
    }
  )
};

function handleSearch(keepTabs) {
  //console.log("currentTabId: " + currentTabId);
  if(keepTabs.length > 0) {
    //console.log("there is a keep tab");
    keepTabId = keepTabs[0].id;
    if(keepTabId === currentTabId) {
      //console.log("I'm in the keep tab");
      browser.tabs.update(previousTab, {active: true,});
    } else {
      //console.log("I'm NOT in the keep tab");
      previousTab = currentTabId;
      browser.tabs.update(keepTabId, {active: true,});
    }
  } else {
    //console.log("there is NO keep tab");
    previousTab = currentTabId;
    createPinnedTab();
  }
};

function handleClick(tab) {
  //console.log("*********Button clicked*********");
  currentTabId = tab.id;
  var querying = browser.tabs.query({url: "*://keep.google.com/*"});
  querying.then(handleSearch, onError);
};

function update(details) {
  if (details.reason === "install" || details.reason === "update") {
    //browser.tabs.create({url: "https://addons.mozilla.org/firefox/addon/pinned-google-keep/versions/?page=1#version-2.1.0"});
    var opening = browser.runtime.openOptionsPage();
    opening.then(onOpened, onError);
  }
};

browser.browserAction.onClicked.addListener(handleClick);
browser.runtime.onInstalled.addListener(update);