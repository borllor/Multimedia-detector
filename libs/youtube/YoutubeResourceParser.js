'use strict';

// https://youtube.com/get_video_info?video_id=t78zZyF3Pq4&el=embedded&eurl=https://youtube.googleapis.com/v/t78zZyF3Pq4&hl=en
const PatternUrl = "https://youtube.com/get_video_info?video_id={0}&el=embedded&eurl=https://youtube.googleapis.com/v/{0}&hl=en";

function YoutubeResourceParser(tab) {
    this.tab = tab;
}
YoutubeResourceParser.prototype.load = function (url, callback) {
    let tab = this.tab;
    let realUrl = PatternUrl.format(this.getVideoId(url));
    let _this = this;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log("loading youtube resource successful!");
            let playerResponse = _this.parseResponse(this.responseText);

            let adaptiveFormats = playerResponse.streamingData.adaptiveFormats;
            if (adaptiveFormats != null && adaptiveFormats.length > 0) {
                //initialize tab data.
                tab.clearData();
                tab.setTitle(playerResponse.videoDetail.title);
                tab.setUrl(url);
                tab.setData(playerResponse);

                for (let i = 0; i < adaptiveFormats.length; i++) {
                    let format = adaptiveFormats[i];
                    let mediaType = _this.getMediaType(format);
                    if (format.url &&
                        ((mediaType === "video" && format.width && format.height) ||
                            (mediaType === "audio" && format.averageBitrate && format.audioSampleRate)) &&
                        format.contentLength) {

                        let res = new Res(format.url, mediaType, format);
                        tab.pushRes(res);
                        logMsg("add a new res, " + res.toString());
                    }
                }
                if (callback) callback.call(tab);
            }
        }
    };
    xhttp.open("GET", realUrl, true);
    xhttp.send();
}
YoutubeResourceParser.prototype.getVideoId = function (url) {
    let urlAndParams = url.split("?");
    if (urlAndParams && urlAndParams.length > 1) {
        let params = urlAndParams[1].split("&");
        for (let i = 0; i < params.length; i++) {
            let kv = params[i].split("=");
            if (kv[0].trim() == "v") {
                return kv[1].trim();
            }
        }
    }
    return null;
}
YoutubeResourceParser.prototype.getMediaType = function (adaptiveFormat) {
    if (adaptiveFormat.audioQuality && adaptiveFormat.mimeType.startsWith("audio/")) {
        return "audio";
    }
    if (adaptiveFormat.qualityLabel && adaptiveFormat.mimeType.startsWith("video/")) {
        return "video";
    }
}
YoutubeResourceParser.prototype.parseResponse = function (response) {
    let map = this.parseGetVideoInfoResponse(response);
    return this.parsePlayerResponse(map.get("player_response"));
}
// request get_video_info for geting response of video infomation.
// https://youtube.com/get_video_info?video_id={videoId}&el=embedded&eurl=https://youtube.googleapis.com/v/{videoId}&hl=en
YoutubeResourceParser.prototype.parseGetVideoInfoResponse = function (response) {
    let map = new Map();
    let paramsEncoded = response.split("&");
    for (let i = 0; i < paramsEncoded.length; i++) {
        let paramEncoded = paramsEncoded[i];
        let param = decodeURIComponent(paramEncoded);
        // Look for the equals sign
        let equalsPos = param.indexOf('=');
        if (equalsPos <= 0) {
            continue;
        }
        // Get the key and value
        var key = param.substring(0, equalsPos);
        var value = equalsPos < param.length
            ? param.substring(equalsPos + 1)
            : "";

        // Add to dictionary
        map.set(key, value.replace("\u0026", "&").replaceAll("+", " "));
    }
    return map;
}
YoutubeResourceParser.prototype.parsePlayerResponse = function (playerResponseStr) {
    if (!playerResponseStr || playerResponseStr.length < 2) return null;
    playerResponseStr = playerResponseStr.trim();
    let playerResponse = playerResponseStr.toObject();
    let youtubeVideoResource = new YoutubeVideoResource(playerResponse);
    youtubeVideoResource.streamingData = playerResponse["streamingData"];
    youtubeVideoResource.videoDetail = playerResponse["videoDetails"];
    youtubeVideoResource.videoCaption = [];

    if (playerResponse["captions"] &&
        playerResponse["captions"]["playerCaptionsTracklistRenderer"] &&
        playerResponse["captions"]["playerCaptionsTracklistRenderer"]["captionTracks"] &&
        playerResponse["captions"]["playerCaptionsTracklistRenderer"]["captionTracks"].length > 0) {
        let videoCaptions = playerResponse["captions"]["playerCaptionsTracklistRenderer"]["captionTracks"];
        let videoCaption = videoCaptions[0];
        let tmpVideoCaption = new VideoCaption();
        tmpVideoCaption.baseUrl = videoCaption["baseUrl"];
        tmpVideoCaption.name = videoCaption["name"]["simpleText"];
        tmpVideoCaption.languageCode = videoCaption["languageCode"];
        tmpVideoCaption.isTranslatable = videoCaption["isTranslatable"];
        youtubeVideoResource.videoCaption.push(tmpVideoCaption);
    }

    return youtubeVideoResource;
}