'use strick'

function GeneralResourceParser(tab) {
    this.tab = tab;
}
GeneralResourceParser.prototype.load = function (url, callback) {
    let res = new Res(url, "video", null);
    this.tab.pushRes(res);
    logMsg("add a new res, " + res.toString());
    if (callback) callback.call(this.tab);
}