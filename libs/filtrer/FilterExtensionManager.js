'use strict'

function FilterExtensionManager() {
}
FilterExtensionManager.get = function (urlMetaData) {
    /* filterExtensions comes from setting config of filterExtensions field */
    let filterExtensions = setting.filterExtensions;
    let urlInfo = null;
    if (!urlMetaData) return null;
    if (typeof (urlMetaData) === "string") {
        urlInfo = parseURL(urlMetaData);
    } else {
        urlInfo = urlMetaData;
    }
    let filterExtension = null;
    if (urlInfo) {
        filterExtension = filterExtensions[urlInfo.host];
    }
    if (!filterExtension) {
        filterExtension = filterExtensions["General"];
    }
    return FilterExtensionManager.convertToFilterExtension(filterExtension);
}
FilterExtensionManager.convertToFilterExtension = function (fx) {
    let filterExtension = new FilterExtension(fx["name"],
        fx["pathFilter"],
        fx["filterMatchingType"],
        fx["ignoreCase"],
        fx["message"]);
    return filterExtension;
}

