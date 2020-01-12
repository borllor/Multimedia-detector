'use strict';

var currentWindowTab = null;
chrome.runtime.onInstalled.addListener(function () {
    setUrlCollectorVal(new WindowRoot(), function () {
        logMsg("init WindowRoot object!");
    });
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
        logMsg("the tab " + tabId + " is initialized");
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    currentWindowTab = null;
    logMsg("tab " + tabId + " is removed, changeInfo: " + removeInfo.toString());
    clearTabData(tabId);
});

//onAttached, onDetached, onHighlighted
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
    reloadData();
});
chrome.history.onVisited.addListener(function (historyItem) {
    logMsg("historyItem: " + historyItem.toString());
    if (historyItem && historyItem.url) {
        filterUrl(currentWindowTab.id, historyItem.url);
    }
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
        getUrlCollectorVal(function (data) {
            let windowRoot = data;
            if (!windowRoot) { windowRoot = new WindowRoot(); }
            let tab = windowRoot.getTab(tabId);
            if (!tab) {
                tab = new Tab(tabId, (currentWindowTab.url || url), (currentWindowTab.title || ""));
                windowRoot.pushTab(tab);
            }
            let parser = new window[filterExtension.getName() + "ResourceParser"](tab);
            if (!parser) return;
            parser.load(url, function () {
                tab = this;
                if (tab.getResCount()) {
                    logMsg("sum up to add reses, " + tab.getResCount());
                }
            });
            saveWindowRoot(windowRoot);
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
    copyTextToClipboard(document, "");
}
function clearTabData(tabId) {
    getUrlCollectorVal(function (data) {
        let windowRoot = data;
        windowRoot.clearTabData(tabId);
        saveWindowRoot(windowRoot);
    });
}
function reloadData() {
    getUrlCollectorVal(function (data) {
        let windowRoot = data;
        setBadgeText(windowRoot);
        copyResourceUrlToClipboard(document, windowRoot);
    });
}
function saveWindowRoot(windowRoot, callback) {
    setUrlCollectorVal(windowRoot, function () {
        setBadgeText(windowRoot);
        if (setting.isAutoCopyingResourceToClipboard) {
            copyResourceUrlToClipboard(document, windowRoot);
        }
        if (callback) callback.call(windowRoot);
    });
}
function setBadgeText(windowRoot) {
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

function copyResourceUrlToClipboard(document, windowRoot) {
    let summary = "";
    getTabIdBySetting(function (tabId) {
        windowRoot.foreachTabRes(function () {
            summary = summary + this.getUrl() + "\r\n";
        }, tabId);
        copyTextToClipboard(document, summary);
    });
}
