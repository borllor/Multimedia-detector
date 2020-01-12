'use strict';

var setting = {
    "switchType": "current", /* enum: current|all */
    "isAutoCopyingResourceToClipboard": false,
    "limitedBadgeNumber": 99,
    "filterExtensions": {
        "www.youtube.com": {
            "name": "Youtube",
            "pathFilter": ["/watch?v="],
            "filterMatchingType": "text", /* text|regex */
            "ignoreCase": true,
            "message": ""
        },
        "General": {
            "name": "General",
            "pathFilter": [/\.m3u8/i, /\.ts/i],
            "filterMatchingType": "regex", /* text|regex */
            "ignoreCase": true,
            "message": ""
        }
    }
}