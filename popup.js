// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

this.popupName = "dashboardPopup"
let urlCollectorCanvas = document.getElementById('urlCollector');
// When you click the extension app icon to loading the popup.html, 
// then display resources.
function init() {
    var bgPage = chrome.extension.getBackgroundPage();
    bgPage.sendMessageToView();
    setPopupSizeAndPosition();
}
init();

window.setInterval(function () {
    setPopupSizeAndPosition();
}, 100);

var lastPopupWidth = 0;
var lastPopupHeight = 0;
function setPopupSizeAndPosition() {
    chrome.windows.getCurrent(function (window) {
        let width = window.width || 640;
        let height = window.height || 480;
        width = width / 2 - 40;
        height = height - 40;
        if (Math.abs(lastPopupWidth - width) > 1 || Math.abs(lastPopupHeight - height) > 1) {
            document.body.style.width = width + "px";
            document.body.style.height = height + "px";
            lastPopupWidth = width;
            lastPopupHeight = height;
        }
    });
}
function showUrlCollectorValue(windowRoot, tab) {
    let elm = document.getElementById("urlCollector");
    let hasContent = false;
    if (windowRoot) {
        let summary = "";
        let message = "";
        let filterExtension = tab.getFilterExtension();
        let dashboard = tab.getDashboard();
        if (filterExtension.getMessage()) {
            message = "<b><i style='color:red'>" + filterExtension.getMessage() + "</i></b><hr/>";
        }
        dashboard.handleResContent(function (resContent) {
            summary = summary + resContent + "<hr />";
        });
        hasContent = true;
        summary = dashboard.getSummary() + message + summary;
        if (elm) elm.innerHTML = summary;
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