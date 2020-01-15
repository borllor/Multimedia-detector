'use strict';

var currentWindowTab = null;
var currentTab = null;
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
    logMsg("tab " + tabId + " is updated, tab.url: " + tab.url + ", changeInfo: " + changeInfo.toString());
    // happened on a page just requested by refresh button or address bar action.
    if (!currentTab && initializeTabStatus === "undo" &&
        changeInfo["status"] === "loading" &&
        tab.url &&
        !changeInfo["url"] &&
        !changeInfo["title"]) {
        logMsg("Happened on a page just requested by refresh button or address bar action. Need to initialize.", "color: Green; font-weight: bold;");
        filterUrl(tabId, tab.url, true);
    }
    // happened on page changing and backwards or forwards.
    if (changeInfo["status"] === "loading" &&
        changeInfo["url"] &&
        (!currentTab || changeInfo["url"] !== currentTab.getTabUrl())) {
        logMsg("Happened on page changing and backwards or forwards. Need to initialize.", "color: Green; font-weight: bold;");
        currentTab = null;
        initializeTabStatus = "undo";
        filterUrl(tabId, tab.url, true);
    }
    let changed = false;
    let t = currentTab;
    if (changeInfo["title"] && t) {
        t.setTitle(tab.title);
        changed = true;
    }
    if (changed) dataChangedNotification();
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    currentWindowTab = null;
    logMsg("tab " + tabId + " is removed, removeInfo: " + removeInfo.toString());
    removeCurrentTab(tabId);
});

//onAttached, onDetached
chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    logMsg("tab " + removedTabId + " is replaced, the new TabId: " + addedTabId);
    removeCurrentTab(tabId);
});

chrome.tabs.onHighlighted.addListener(function (highlightInfo) {
    logMsg("highlightInfo: " + highlightInfo.toString());
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    logMsg("tab " + activeInfo.tabId + " is activated, activeInfo: " + activeInfo.toString());
    getWindowTabByTabId(activeInfo.tabId, function () {
        currentWindowTab = this;
    });
    currentTab = windowRoot.getTab(activeInfo.tabId);
    if (setting.switchType === "current") {
        clearScene();
    }
    freshScene();
});
chrome.history.onVisited.addListener(function (historyItem) {
    logMsg("historyItem: " + historyItem.toString());
    let changed = false;
    let t = currentTab;
    if (historyItem["title"] && t) {
        t.setTitle(historyItem["title"]);
        changed = true;
    }
    if (changed) dataChangedNotification();
});
chrome.webRequest.onBeforeRequest.addListener(
    function (request) {
        filterUrl(request.tabId, request.url, false);
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
function filterUrl(tabId, url, forceToInit) {
    if (!url) return;
    logMsg("detecting a url: " + url + " and tab url: " + (hasProperty(currentWindowTab, "url") ? currentWindowTab["url"] : "null"));
    // this is the first request from the address bar of the tab, 
    // so need to initialize the fields, "tabUrl", "filterExtension", "parser, dashboard", objects of the tab.
    if (!forceToInit && (!hasProperty(currentWindowTab, "url") || url === currentWindowTab["url"])) {
        // definitely, it happened the new coming request.
        logMsg("Definitely, it happened the new coming request.", "color:Yellow");
        initializeTabStatus = "undo";
        currentTab = null;
        return;
    }
    if (forceToInit) {
        currentTab = initializeTab(tabId, url);
    }
    let tab = currentTab;
    if (!tab) {
        return;
    }
    let filterExtension = tab.getFilterExtension();
    let urlMetaData = parseURL(url);
    if (filtered(urlMetaData, filterExtension)) {
        let parser = tab.getParser();
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
    //let filterMatchingType = filterExtension.getFilterMatchingType();
    let pathFilter = filterExtension.getPathFilter();
    if (pathFilter && pathFilter.length > 0) {
        let path = urlMetaData.path;
        for (let i = 0; i < pathFilter.length; i++) {
            let filter = pathFilter[i];
            if (typeof (filter) === "string") {
                if (path.indexOf(filter) >= 0) {
                    return true;
                }
            } else {
                if (filter.test(path)) {
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
function clearTabRes(tabId) {
    windowRoot.clearTabRes(tabId);
}
function clearTabData(tabId) {
    windowRoot.clearTabData(tabId);
}
function removeCurrentTab(tabId) {
    tabId = tabId || currentTab.tabId;
    if (tabId) {
        windowRoot.removeTab(tabId);
    }
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
        views[0].showUrlCollectorValue(windowRoot, windowRoot.getTab(currentWindowTab.id));
    }
}
var initializeTabStatus = "undo";
function initializeTab(tabId, tabUrl) {
    if (initializeTabStatus == "doing") return null;
    initializeTabStatus = "doing";
    currentTab = null;
    if (!windowRoot) { windowRoot = new WindowRoot(); }
    let tab = windowRoot.getTab(tabId);
    if (!tab) {
        tab = new Tab(tabId);
        windowRoot.pushTab(tab);
    } else {
        windowRoot.clearTabData(tabId);
    }
    let filterExtension = FilterExtensionManager.get(tabUrl);
    if (!filterExtension) {
        return;
    }
    tab.setUrl(tabUrl);
    tab.setTabUrl(tabUrl);
    tab.setFilterExtension(filterExtension);
    tab.setDashboard(new window[filterExtension.getDashboardClassName()](tab));
    tab.setParser(new window[filterExtension.getParserClassName()](tab));
    logMsg("initializeTab, initialized, filterExtension:" + filterExtension.getName() + ", tab: " + tabUrl, "color: red; font-weight: bold;");
    initializeTabStatus = "done";

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
