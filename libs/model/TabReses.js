'use strict';

function TabReses() {
    this._col = [];
    this._count = 0;
    this.__type = "TabReses";
}
TabReses.prototype.get = function (res) {
    for (let i = 0; i < this._col.length; i++) {
        if (this._col[i].getHash() === res.getHash()
            && this._col[i].getUrl() === res.getUrl()) {
            return this._col[i];
        }
    }
    return null;
}
TabReses.prototype.getCount = function () {
    return this._count;
}
TabReses.prototype.push = function (res) {
    if (!this.get(res)) {
        this._count++;
        this._col.push(res);
        return true;
    }
    return false;
}
TabReses.prototype.clearReses = function (callback) {
    let arr = this._col.splice(0, this._col.length)
    this._count = 0;
    this._col = [];
    return arr;
}
TabReses.prototype.foreach = function (callback) {
    for (let i = 0; i < this._col.length; i++) {
        if (callback) callback.call(this._col[i]);
    }
}