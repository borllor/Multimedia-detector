'use strict'

function YoutubeDashboard(tab) {
    this._tab = tab;
}
YoutubeDashboard.prototype.getTab = function () {
    return this._tab;
}
YoutubeDashboard.prototype.getSummary = function (callback) {
    let tab = this.getTab();
    let videoCount = 0;
    let audioCount = 0;
    let title = "";
    let url = "";
    if (tab["_title"]) title = tab.getTitle();
    if (tab["_url"]) url = tab.getTabUrl();
    tab.foreachRes(function () {
        let res = this;
        if (res.getMediaType() === "video") videoCount++;
        else if (res.getMediaType() === "audio") audioCount++;
    });
    return "Summary: Video: " + videoCount + ", Audio: " + audioCount + "<br />" +
        title + "<br />" +
        url + "<hr />";
}

YoutubeDashboard.prototype.handleResContent = function (callback) {
    let tab = this.getTab();
    tab.foreachRes(function () {
        let res = this;
        let builder = "";
        let adaptiveFormat = res.getExt();
        let contentLength = parseInt(adaptiveFormat.contentLength || "0");
        let firstSummary = "";
        if (res.getMediaType() === "video") {
            firstSummary = "{0}({1})".format(res.getMediaType(), adaptiveFormat.qualityLabel);
        } else if (res.getMediaType() === "audio") {
            firstSummary = "{0}".format(res.getMediaType());
        }
        builder = "{1},{2},<input type='button' url='{0}' value='Copy'/>,<a href='{0}'>{0}</a>,{3}".format(
            adaptiveFormat.url, firstSummary, formatBytes(contentLength), adaptiveFormat.mimeType);
        if (callback) callback.call(res, builder);
    });
}