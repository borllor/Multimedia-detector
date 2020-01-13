'use strict'


function FilterExtensionManager() {
}
FilterExtensionManager.default;

FilterExtensionManager._init = function () {
    FilterExtensionManager.default = FilterExtensionManager.convertToFilterExtension(setting.filterExtensions["General"]);
}
FilterExtensionManager.get = function (urlOrMetaData) {
    /* filterExtensions comes from setting config of filterExtensions field */
    let filterExtensions = setting.filterExtensions;
    let urlInfo = null;
    if (!urlOrMetaData) return null;
    if (typeof (urlOrMetaData) === "string") {
        urlInfo = parseURL(urlOrMetaData);
    } else {
        urlInfo = urlOrMetaData;
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
FilterExtensionManager._init();
