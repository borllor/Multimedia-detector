// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let urlCollectorCanvas = document.getElementById('urlCollector');

// When you click the extension app icon to loading the popup.html, 
// then display urlCollector value.
getUrlCollectorVal(function (data) {
    showUrlCollectorValue(data);
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let key in changes) {
        if (key === UrlCollectorStorageName) {
            // When capturing a new url, print it.
            let windowRoot = changes[key].newValue;
            showUrlCollectorValue(assignType(windowRoot));
            logMsg("chrome's storage has changed")
        }
    }
});

function showUrlCollectorValue(windowRoot) {
    let elm = document.getElementById("urlCollector");
    let hasContent = false;
    if (windowRoot) {
        let summary = "";
        let url = "";
        getTabIdBySetting(function (currentTabId) {
            let tab = windowRoot.getTab(currentTabId);
            if (!tab["_url"]) return;
            url = tab.getUrl();
            let urlMetaData = parseURL(url);
            let filterExtension = FilterExtensionManager.get(urlMetaData);
            let dashboard = new window[filterExtension.getName() + "Dashboard"](tab);
            if (!dashboard) return;
            dashboard.handleResContent(function (resContent) {
                summary = summary + resContent + "<hr />";
            });
            hasContent = true;
            summary = dashboard.getSummary() + summary;
            if (elm) elm.innerHTML = summary;
        });
        if (!hasContent) elm.innerHTML = "";
    }
}
document.addEventListener("click", function (event) {
    logMsg("document clicked: " + JSON.stringify(event));
});
urlCollectorCanvas.addEventListener("click", function (event) {
    let tar = event.target;
    let url = "";
    if (tar && (url = tar.getAttribute("url"))) {
        tar.value = "Copied";
        copyTextToClipboard(document, url);
        logMsg("resource copied, " + url);
    }
    logMsg("div clicked: " + JSON.stringify(event));
    event.stopPropagation();
});