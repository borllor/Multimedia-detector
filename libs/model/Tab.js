'use strict';

function Tab(tabId, url, title, data) {
    this._tabReses = new TabReses(); // collector for Res
    this._tabId = tabId;
    this._url = url || "";
    this._title = title || "";
    this._data = data || null; //store the original data

    this.__type = "Tab";
}
Tab.prototype.getCol = function () {
    return this._tabReses;
}
Tab.prototype.getUrl = function () {
    return this._url;
}
Tab.prototype.setUrl = function (url) {
    this._url = url;
    return this;
}
Tab.prototype.getTitle = function () {
    return this._title;
}
Tab.prototype.setTitle = function (title) {
    this._title = title;
    return this;
}
Tab.prototype.getData = function () {
    return this._data;
}
Tab.prototype.setData = function (data) {
    this._data = data;
    return this;
}
Tab.prototype.setProperties = function (kv) {
    if (kv && typeof (kv) === "object") {
        for (k in kv) {
            let kk = k.startsWith("_") ? k : "_" + k;
            this[kk] = kv[k];
        }
    }
    return this;
}
Tab.prototype.getTabId = function () {
    return this._tabId;
}
Tab.prototype.getResCount = function () {
    return this._tabReses.getCount();
}
Tab.prototype.pushRes = function (res) {
    return this._tabReses.push(res);
}
Tab.prototype.clearData = function () {
    this._url = "";
    this._title = "";
    this._data = null;
    this._tabReses.clearReses();
}
Tab.prototype.foreachRes = function (callback) {
    this._tabReses.foreach(callback);
}