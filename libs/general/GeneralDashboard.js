'use strict'

function GeneralDashboard(tab) {
    this.tab = tab;
}
GeneralDashboard.prototype.getSummary = function (callback) {
    let title = "";
    let url = "";
    if (this.tab["_title"]) title = this.tab.getTitle();
    if (this.tab["_url"]) url = this.tab.getUrl();
    return title + "<br />" + url + "<hr />";
}

GeneralDashboard.prototype.handleResContent = function (callback) {
    this.tab.foreachRes(function () {
        let res = this;
        let builder = "<input type='button' url='{0}' value='Copy'/>,<a href='{0}'>{0}</a>".format(res.getUrl());
        if (callback) callback.call(res, builder);
    });
}