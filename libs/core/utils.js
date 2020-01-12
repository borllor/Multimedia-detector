'use strict';

function existsInArray(arr, newValue) {
    if (arr && typeof (arr) === typeof ([])) {
        for (let i = 0; i < arr.length; i++) {
            if (newValue === arr[i]) {
                return true;
            }
        }
    }
    return false;
}

function assignType(object) {
    if (object && typeof (object) === 'object' && window[object.__type]) {
        object = assignTypeRecursion(object.__type, object);
    }
    return object;
}

function assignTypeRecursion(type, object) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            var obj = object[key];
            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; ++i) {
                    var arrItem = obj[i];
                    if (arrItem && typeof (arrItem) === 'object' && window[arrItem.__type]) {
                        obj[i] = assignTypeRecursion(arrItem.__type, arrItem);
                    }
                }
            } else if (obj && typeof (obj) === 'object' && window[obj.__type]) {
                object[key] = assignTypeRecursion(obj.__type, obj);
            }
        }
    }
    return Object.assign(new window[type](), object);
}

function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1024, dm = decimals <= 0 ? 0 : decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function copyTextToClipboard(doc, text) {
    //Create a textbox field where we can insert text to. 
    var copyFrom = doc.createElement("textarea");

    //Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;

    //Append the textbox field into the body as a child. 
    //"execCommand()" only works when there exists selected text, and the text is inside 
    //document.body (meaning the text is part of a valid rendered HTML element).
    doc.body.appendChild(copyFrom);

    //Select all the text!
    copyFrom.select();

    //Execute command
    doc.execCommand('copy');

    //(Optional) De-select the text using blur(). 
    copyFrom.blur();

    //Remove the textbox field from the document.body, so no other JavaScript nor 
    //other elements can get access to this.
    doc.body.removeChild(copyFrom);
}
function parseURL(url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        url: parser.href,
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash,
        path: parser.pathname + parser.search + parser.hash
    };
}