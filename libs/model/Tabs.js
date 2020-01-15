'use strict';

function Tabs() {
    this._col = [];
    this._count = 0;

    this.__type = "Tabs";
}
Tabs.prototype.get = function (tabId) {
    for (let i = 0; i < this._col.length; i++) {
        if (this._col[i].getTabId() === tabId) {
            return this._col[i];
        }
    }
    return null;
}
Tabs.prototype.removeTab = function (tabId) {
    for (let i = 0; i < this._col.length; i++) {
        if (this._col[i].getTabId() === tabId) {
            return this._col.splice(i, 1);
        }
    }
    return null;
}
Tabs.prototype.getCol = function () {
    return this._col;
}
Tabs.prototype.getCount = function () {
    return this._count;
}
Tabs.prototype.getTabResCount = function (tabId) {
    let cnt = 0;
    if (tabId) {
        let t = this.get(tabId);
        if (t) cnt = t.getResCount();
    } else {
        this.foreach(function (tab) {
            cnt = cnt + tab.getResCount();
        });
    }
    return cnt;
}
Tabs.prototype.setTabData = function (tabId, data) {
    let t = this.get(tabId);
    if (t) t.setData(data);
    return t;
}
Tabs.prototype.setTabTitle = function (tabId, title) {
    let t = this.get(tabId);
    if (t) t.setTitle(title);
    return t;
}
Tabs.prototype.setTabUrl = function (tabId, url) {
    let t = this.get(tabId);
    if (t) t.setUrl(url);
    return t;
}
Tabs.prototype.setTabProperties = function (tabId, kv) {
    let t = this.get(tabId);
    if (t) t.setTabProperties(kv);
    return t;
}
Tabs.prototype.push = function (tab) {
    if (!this.get(tab.getTabId())) {
        this._count++;
        this._col.push(tab);
        return true;
    }
    return false;
}
Tabs.prototype.pushRes = function (tabId, res) {
    let t = this.get(tabId);
    if (t) {
        return t.pushRes(res);
    }
    return false;
}
Tabs.prototype.clearTabRes = function (tabId) {
    let t = this.get(tabId);
    if (t) {
        return t.clearRes();
    }
    return null;
}
Tabs.prototype.clearTabData = function (tabId) {
    let t = this.get(tabId);
    if (t) {
        return t.clearData();
    }
    return null;
}
Tabs.prototype.foreach = function (callback) {
    for (let i = 0; i < this._col.length; i++) {
        if (callback) callback.call(this._col[i]);
    }
}