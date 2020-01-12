'use strict';

function StreamingDataFormat() {
    this.itag = 0;
    this.url = "";
    this.mimeType = "";
    this.bitrate = 0;
    this.width = 0;
    this.height = 0;
    this.lastModified = "";
    this.contentLength = "";
    this.quality = "";
    this.qualityLabel = "";
    this.projectionType = "";
    this.averageBitrate = 0;
    this.audioQuality = "";
    this.approxDurationMs = "";
    this.audioSampleRate = "";
    this.audioChannels = 0;

    this.__type = "StreamingDataFormat";
}