'use strict';

var currentWindowTab = null;
var windowRoot = null;
chrome.runtime.onInstalled.addListener(function () {
    windowRoot = new WindowRoot();

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({ pageUrl: { urlContains: ':' } })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.tabs.onCreated.addListener(function (tab) {
    logMsg("the tab created, " + tab.toString());
    currentWindowTab = tab;
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // When refreshing the tab page, clear urlCollector's data.
    currentWindowTab = tab;
    logMsg("tab " + tabId + " is updated, changeInfo: " + changeInfo.toString());
    if (changeInfo["status"] === "loading" && !changeInfo["url"]) {
        clearScene();
        clearTabData(tabId);
    }
    let changed = false;
    let t = ensureTabExists(tabId);
    if (changeInfo["url"]) {
        t.setUrl(changeInfo["url"]);
        changed = true;
    }
    if (changeInfo["title"]) {
        t.setTitle(changeInfo["title"]);
        changed = true;
    }
    if (changed) dataChangedNotification();
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    currentWindowTab = null;
    logMsg("tab " + tabId + " is removed, removeInfo: " + removeInfo.toString());
    clearTabData(tabId);
});

//onAttached, onDetached
chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    logMsg("tab " + removedTabId + " is replaced, the new TabId: " + addedTabId);
    clearTabData(removedTabId);
});

chrome.tabs.onHighlighted.addListener(function (highlightInfo) {
    logMsg("highlightInfo: " + highlightInfo.toString());
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    let _this = this;
    getWindowTabByTabId(activeInfo.tabId, function () {
        _this.currentTabId = this;
    });
    logMsg("tab " + activeInfo.tabId + " is activated, activeInfo: " + activeInfo.toString());
    if (setting.switchType === "current") {
        clearScene();
    }
    freshScene();
});
chrome.history.onVisited.addListener(function (historyItem) {
    logMsg("historyItem: " + historyItem.toString());
    let changed = false;
    let tabId = currentTabId.id;
    let t = ensureTabExists(tabId);
    if (historyItem["url"]) {
        clearTabData(tabId);
        t.setUrl(historyItem["url"]);
        changed = true;
        filterUrl(historyItem["url"], tabId)
    }
    if (historyItem["title"]) {
        t.setTitle(historyItem["title"]);
        changed = true;
    }
    if (changed) dataChangedNotification();
});
chrome.webRequest.onBeforeRequest.addListener(
    function (request) {
        filterUrl(request.tabId, request.url);
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
function filterUrl(tabId, url) {
    if (!url) return;
    let urlMetaData = parseURL(url);
    let filterExtension = FilterExtensionManager.get(urlMetaData);
    if (filterExtension && filtered(urlMetaData, filterExtension)) {
        logMsg("detecting a url: " + url);
        let tab = ensureTabExists(tabId);
        let parser = new window[filterExtension.getName() + "ResourceParser"](tab);
        if (!parser) return;
        parser.load(url, function () {
            tab = this;
            if (tab.getResCount()) {
                dataChangedNotification();
                logMsg("sum up to add reses, " + tab.getResCount());
            }
        });
    }
}
function filtered(urlMetaData, filterExtension) {
    let filterMatchingType = filterExtension.getFilterMatchingType();
    let pathFilter = filterExtension.getPathFilter();
    if (pathFilter && pathFilter.length > 0) {
        let path = urlMetaData.path;
        for (let i = 0; i < pathFilter.length; i++) {
            let filter = pathFilter[i];
            if (filterMatchingType == "regex") {
                if (filter.test(path)) {
                    return true;
                }
            } else {
                if (path.indexOf(filter) >= 0) {
                    return true;
                }
            }
        }
    }
    return false;
}
function clearScene() {
    chrome.browserAction.setBadgeText({ text: "" });
}
function freshScene() {
    setBadgeText();
}
function clearTabData(tabId) {
    windowRoot.clearTabData(tabId);
}
function dataChangedNotification(callback) {
    freshScene();
    sendMessageToView();
}
function sendMessageToView() {
    var views = chrome.extension.getViews({
        type: "popup"
    });
    if (views != null && views.length > 0 && views[0]["popupName"] === "dashboardPopup") {
        views[0].showUrlCollectorValue(windowRoot, currentWindowTab.id);
    }
}
function ensureTabExists(tabId) {
    if (!windowRoot) { windowRoot = new WindowRoot(); }
    let tab = windowRoot.getTab(tabId);
    if (!tab) {
        tab = new Tab(tabId);
        windowRoot.pushTab(tab);
    }
    return tab;
}
function setBadgeText() {
    getTabIdBySetting(function (tabId) {
        let resourceCount = windowRoot.getTabResCount(tabId);
        if (resourceCount <= 0) {
            chrome.browserAction.setBadgeText({ text: "" });
            return;
        }
        var badgeText = resourceCount > setting.limitedBadgeNumber ? (setting.limitedBadgeNumber + "+") : (resourceCount + "")
        chrome.browserAction.setBadgeText({ text: badgeText });
    });
}
