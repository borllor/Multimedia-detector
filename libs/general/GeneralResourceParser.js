'use strick'

function GeneralResourceParser(tab) {
    this._tab = tab;
}
GeneralResourceParser.prototype.load = function (url, callback) {
    let tab = this._tab;
    let res = new Res(url, "video", null);
    tab.pushRes(res);
    logMsg("add a new res, " + res.toString());
    if (callback) callback.call(tab);
}