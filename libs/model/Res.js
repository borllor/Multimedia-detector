'use strict';

function Res(url, mediaType, ext) {
    this._url = url;
    this._ext = ext;
    this._mediaType = mediaType;
    this._hash = md5(url);
    this.__type = "Res";
}
Res.prototype.getUrl = function () {
    return this._url;
}
Res.prototype.setUrl = function (url) {
    this._url = url;
    return this;
}
Res.prototype.getMediaType = function () {
    return this._mediaType;
}
Res.prototype.setMediaType = function (mediaType) {
    this._mediaType = mediaType;
    return this;
}
Res.prototype.getExt = function () {
    return this._ext;
}
Res.prototype.setExt = function (ext) {
    this._ext = ext;
    return this;
}
Res.prototype.setProperties = function (kv) {
    if (kv && typeof (kv) === "object") {
        for (k in kv) {
            let kk = k.startsWith("_") ? k : "_" + k;
            this[kk] = kv[k];
        }
    }
    return this;
}
Res.prototype.getHash = function () {
    return this._hash;
}