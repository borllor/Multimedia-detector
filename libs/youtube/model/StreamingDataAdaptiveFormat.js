'use strict';

function StreamingDataAdaptiveFormat() {
    StreamingDataFormat.call(this);

    this.initRange = new TimeRange(); //new field comparing StreamingDataFormat
    this.indexRange = new TimeRange(); //new field comparing StreamingDataFormat
    this.fps = 0; //new field comparing StreamingDataFormat
    this.colorInfo = new ColorInfo(); //new field comparing StreamingDataFormat

    this.__type = "StreamingDataAdaptiveFormat";
}