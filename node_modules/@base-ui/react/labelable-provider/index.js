"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _LabelableProvider = require("./LabelableProvider");
Object.keys(_LabelableProvider).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _LabelableProvider[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _LabelableProvider[key];
    }
  });
});