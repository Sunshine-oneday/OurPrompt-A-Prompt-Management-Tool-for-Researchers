"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDelay = getDelay;
exports.getRestMs = getRestMs;
exports.isClickLikeOpenEvent = isClickLikeOpenEvent;
var _utils = require("../utils");
function resolveValue(value, pointerType) {
  if (pointerType != null && !(0, _utils.isMouseLikePointerType)(pointerType)) {
    return 0;
  }
  if (typeof value === 'function') {
    return value();
  }
  return value;
}
function getDelay(value, prop, pointerType) {
  const result = resolveValue(value, pointerType);
  if (typeof result === 'number') {
    return result;
  }
  return result?.[prop];
}
function getRestMs(value) {
  if (typeof value === 'function') {
    return value();
  }
  return value;
}
function isClickLikeOpenEvent(openEventType, interactedInside) {
  return interactedInside || openEventType === 'click' || openEventType === 'mousedown';
}