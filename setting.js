'use strict';

var setting = {
    "switchType": "current", /* enum: current|all */
    "limitedBadgeNumber": 99,
    "filterExtensions": {
        "www.youtube.com": {
            "name": "Youtube",
            "parserClassName": "YoutubeResourceParser",
            "dashboardClassName": "YoutubeDashboard",
            "pathFilter": ["/watch?v="],
            "ignoreCase": true,
            "message": "For youtube resources, you may notice that the tracks of video are split to video and audio files. So for us, we need to download any video you want and any audio you want and then merge them into one file. There is one merging tool that I recommend, FFmpeg, which is open-source code. You just only input \"ffmpeg -i [videoPath] -i [audioPath] -c copy filePath\" command in the terminal, then you will get the whole file."
        },
        "v.youku.com": {
            "name": "Youku",
            "parserClassName": "GeneralResourceParser",
            "dashboardClassName": "GeneralDashboard",
            "pathFilter": ["/playlist/m3u8?vid=", /\.m3u8/i, /\.m3u/i, /\.ts/i],
            "ignoreCase": true,
            "message": ""
        },
        "General": {
            "name": "General",
            "parserClassName": "GeneralResourceParser",
            "dashboardClassName": "GeneralDashboard",
            "pathFilter": [/\.m3u8/i, /\.m3u/i, /\.ts/i, /\.mp3/i, /\.mp4/i, /\.flv/i],
            "ignoreCase": true,
            "message": ""
        }
    }
}