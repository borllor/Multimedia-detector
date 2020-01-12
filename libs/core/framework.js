'use strict';

// declare global variables
var storage = chrome.storage.local;
var UrlCollectorStorageName = "UrlCollector";

function getUrlCollectorVal(callback) {
    let _this = this;
    storage.get("UrlCollector", function (data) {
        if (callback && data) {
            callback.call(_this, applyWindowRootPrototype(data[UrlCollectorStorageName]));
        }
    });
}

function setUrlCollectorVal(value, callback) {
    let _this = this;
    storage.set({ "UrlCollector": value }, function () {
        if (callback) callback.call(_this)
    });
}

function applyWindowRootPrototype(windowRoot) {
    if (windowRoot && typeof (windowRoot.pushRes) === "function") {
        return windowRoot;
    }
    return assignType(windowRoot);
}

// when tabId = 0, it will enumerate all resource or the special tab 
function forEachResourceInWindowRoot(windowRoot, tabId, callback) {
    if (windowRoot && callback) {
        for (let tid in windowRoot) {
            if (tabId === 0 || tabId.toString() === tid) {
                let tabCol = windowRoot[tid];
                for (let i = 0; i < tabCol.length; i++) {
                    callback.call(tabCol[i], tid, windowRoot);
                }
            }
        }
    }
}

function getTabIdBySetting(callback) {
    if (setting && setting.switchType === "current") {
        let query = { active: true, lastFocusedWindow: true };
        chrome.tabs.query(query, function (tabs) {
            if (tabs && tabs.length > 0) {
                let currentTab = tabs[0];
                if (callback) callback.call(currentTab, currentTab.id)
            }
        });
    }
}
function getWindowTabByTabId(tabId, callback) {
    chrome.tabs.get(tabId, function (tab) {
        callback.call(tab);
    });
}
function logMsg(msg) {
    console.log(msg);
}