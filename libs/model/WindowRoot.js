'use strict';

function WindowRoot() {
    this._tabs = new Tabs(); // collector for Tab
    this.__type = "WindowRoot";
}
WindowRoot.prototype.getTab = function (tabId) {
    return this._tabs.get(tabId);
}
WindowRoot.prototype.removeTab = function (tabId) {
    return this._tabs.removeTab(tabId);
}
WindowRoot.prototype.getTabCount = function () {
    return this._tabs.count;
}
WindowRoot.prototype.getTabResCount = function (tabId) {
    return this._tabs.getTabResCount(tabId);
}
WindowRoot.prototype.setTabData = function (tabId, data) {
    return this._tabs.setTabData(tabId, data);
}
WindowRoot.prototype.setTabTitle = function (tabId, title) {
    return this._tabs.setTabTitle(tabId, title);
}
WindowRoot.prototype.setTabUrl = function (tabId, title) {
    return this._tabs.setTabUrl(tabId, title);
}
WindowRoot.prototype.setTabProperties = function (tabId, kv) {
    return this._tabs.setTabProperties(tabId, kv);
}
WindowRoot.prototype.pushTab = function (tab) {
    return this._tabs.push(tab);
}
WindowRoot.prototype.pushRes = function (tabId, res) {
    return this._tabs.pushRes(tabId, res);
}
WindowRoot.prototype.clearTabRes = function (tabId) {
    return this._tabs.clearTabRes(tabId);
}
WindowRoot.prototype.clearTabData = function (tabId) {
    return this._tabs.clearTabData(tabId);
}
WindowRoot.prototype.foreachTab = function (callback) {
    this._tabs.foreach(callback);
}
WindowRoot.prototype.foreachTabRes = function (callback, tabId) {
    if (tabId) {
        let t = this._tabs.get(tabId);
        if (t) t.foreachRes(callback);
    } else {
        this._tabs.foreach(function (tab) {
            tab.foreachRes(callback)
        });
    }
}