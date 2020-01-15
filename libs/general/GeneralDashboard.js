'use strict'

function GeneralDashboard(tab) {
    this._tab = tab;
}
GeneralDashboard.prototype.getTab = function () {
    return this._tab;
}
GeneralDashboard.prototype.getSummary = function (callback) {
    let tab = this.getTab();
    let title = "";
    let url = "";
    if (tab["_title"]) title = tab.getTitle();
    if (tab["_url"]) url = tab.getTabUrl();
    return title + "<br />" + url + "<hr />";
}

GeneralDashboard.prototype.handleResContent = function (callback) {
    let tab = this.getTab();
    tab.foreachRes(function () {
        let res = this;
        let builder = "<input type='button' url='{0}' value='Copy'/>,<a href='{0}'>{0}</a>".format(res.getUrl());
        if (callback) callback.call(res, builder);
    });
}