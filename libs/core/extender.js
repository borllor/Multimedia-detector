
'use strict';

/* begin: Object extension */
Object.prototype.toString = function (fields) {
  let obj = this;
  if (fields && typeof (fields) === "array" && fields.length > 0) {
    return JSON.stringify(obj, fields);
  }
  return JSON.stringify(obj);
}
/* end: Object extension */

/* begin: Array extension */
Array.prototype.toString = function (separator) {
  let sep = !separator ? "," : separator;
  let arr = this;
  if (arr && arr.length > 0) {
    return arr.join(sep);
  }
  return null;
}
/* end: Array extension */

/* begin: String extension */
String.prototype.toObject = function () {
  let json = this;
  if (json &&
    json.length > 1 &&
    json.startsWith("{") &&
    json.endsWith("}")) {
    return JSON.parse(json);
  } else {
    return null;
  }
}

String.prototype.format = function (args) {
  var result = this;
  if (arguments.length > 0) {
    if (arguments.length == 1 && typeof (args) == "object") {
      for (var key in args) {
        if (args[key] != undefined) {
          var reg = new RegExp("({" + key + "})", "g");
          result = result.replace(reg, args[key]);
        }
      }
    }
    else {
      for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != undefined) {
          var reg = new RegExp("({)" + i + "(})", "g");
          result = result.replace(reg, arguments[i]);
        }
      }
    }
  }
  return result;
}
String.prototype.replaceAll = function (f, r) { return this.split(f).join(r); }
if (!String.format) {
  String.format = function () {
    if (arguments && arguments.length > 0) {
      arguments[0].format(arguments.shift());
    }
  }
}

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}
/* end: String extension */
/* begin: Event extension */
(function () {
  if (!Event.prototype.preventDefault) {
    Event.prototype.preventDefault = function () {
      this.returnValue = false;
    };
  }
  if (!Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation = function () {
      this.cancelBubble = true;
    };
  }
  if (!Element.prototype.addEventListener) {
    var eventListeners = [];

    var addEventListener = function (type, listener /*, useCapture (will be ignored) */) {
      var self = this;
      var wrapper = function (e) {
        e.target = e.srcElement;
        e.currentTarget = self;
        if (typeof listener.handleEvent != 'undefined') {
          listener.handleEvent(e);
        } else {
          listener.call(self, e);
        }
      };
      if (type == "DOMContentLoaded") {
        var wrapper2 = function (e) {
          if (document.readyState == "complete") {
            wrapper(e);
          }
        };
        document.attachEvent("onreadystatechange", wrapper2);
        eventListeners.push({ object: this, type: type, listener: listener, wrapper: wrapper2 });

        if (document.readyState == "complete") {
          var e = new Event();
          e.srcElement = window;
          wrapper2(e);
        }
      } else {
        this.attachEvent("on" + type, wrapper);
        eventListeners.push({ object: this, type: type, listener: listener, wrapper: wrapper });
      }
    };
    var removeEventListener = function (type, listener /*, useCapture (will be ignored) */) {
      var counter = 0;
      while (counter < eventListeners.length) {
        var eventListener = eventListeners[counter];
        if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {
          if (type == "DOMContentLoaded") {
            this.detachEvent("onreadystatechange", eventListener.wrapper);
          } else {
            this.detachEvent("on" + type, eventListener.wrapper);
          }
          eventListeners.splice(counter, 1);
          break;
        }
        ++counter;
      }
    };
    Element.prototype.addEventListener = addEventListener;
    Element.prototype.removeEventListener = removeEventListener;
    if (HTMLDocument) {
      HTMLDocument.prototype.addEventListener = addEventListener;
      HTMLDocument.prototype.removeEventListener = removeEventListener;
    }
    if (Window) {
      Window.prototype.addEventListener = addEventListener;
      Window.prototype.removeEventListener = removeEventListener;
    }
  }
})();
/* end: Event extension */
