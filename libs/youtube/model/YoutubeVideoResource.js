'use strict'

function YoutubeVideoResource(originalData) {
    this.streamingData = new StreamingData();
    this.videoCaption = [];
    this.videoDetail = new VideoDetial();
    this.originalData = originalData;
    this.__type = "YoutubeVideoResource";
}