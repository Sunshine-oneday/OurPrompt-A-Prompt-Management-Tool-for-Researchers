"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.disableFocusInside = disableFocusInside;
exports.enableFocusInside = enableFocusInside;
exports.getNextTabbable = getNextTabbable;
exports.getPreviousTabbable = getPreviousTabbable;
exports.getTabbableAfterElement = getTabbableAfterElement;
exports.getTabbableBeforeElement = getTabbableBeforeElement;
exports.getTabbableOptions = void 0;
exports.isOutsideEvent = isOutsideEvent;
var _tabbable = require("tabbable");
var _owner = require("@base-ui/utils/owner");
var _element = require("./element");
const getTabbableOptions = () => ({
  getShadowRoot: true,
  displayCheck:
  // JSDOM does not support the `tabbable` library. To solve this we can
  // check if `ResizeObserver` is a real function (not polyfilled), which
  // determines if the current environment is JSDOM-like.
  typeof ResizeObserver === 'function' && ResizeObserver.toString().includes('[native code]') ? 'full' : 'none'
});
exports.getTabbableOptions = getTabbableOptions;
function getTabbableIn(container, dir) {
  const list = (0, _tabbable.tabbable)(container, getTabbableOptions());
  const len = list.length;
  if (len === 0) {
    return undefined;
  }
  const active = (0, _element.activeElement)((0, _owner.ownerDocument)(container));
  const index = list.indexOf(active);
  // eslint-disable-next-line no-nested-ternary
  const nextIndex = index === -1 ? dir === 1 ? 0 : len - 1 : index + dir;
  return list[nextIndex];
}
function getNextTabbable(referenceElement) {
  return getTabbableIn((0, _owner.ownerDocument)(referenceElement).body, 1) || referenceElement;
}
function getPreviousTabbable(referenceElement) {
  return getTabbableIn((0, _owner.ownerDocument)(referenceElement).body, -1) || referenceElement;
}
function getTabbableNearElement(referenceElement, dir) {
  if (!referenceElement) {
    return null;
  }
  const list = (0, _tabbable.tabbable)((0, _owner.ownerDocument)(referenceElement).body, getTabbableOptions());
  const elementCount = list.length;
  if (elementCount === 0) {
    return null;
  }
  const index = list.indexOf(referenceElement);
  if (index === -1) {
    return null;
  }
  const nextIndex = (index + dir + elementCount) % elementCount;
  return list[nextIndex];
}
function getTabbableAfterElement(referenceElement) {
  return getTabbableNearElement(referenceElement, 1);
}
function getTabbableBeforeElement(referenceElement) {
  return getTabbableNearElement(referenceElement, -1);
}
function isOutsideEvent(event, container) {
  const containerElement = container || event.currentTarget;
  const relatedTarget = event.relatedTarget;
  return !relatedTarget || !(0, _element.contains)(containerElement, relatedTarget);
}
function disableFocusInside(container) {
  const tabbableElements = (0, _tabbable.tabbable)(container, getTabbableOptions());
  tabbableElements.forEach(element => {
    element.dataset.tabindex = element.getAttribute('tabindex') || '';
    element.setAttribute('tabindex', '-1');
  });
}
function enableFocusInside(container) {
  const elements = container.querySelectorAll('[data-tabindex]');
  elements.forEach(element => {
    const tabindex = element.dataset.tabindex;
    delete element.dataset.tabindex;
    if (tabindex) {
      element.setAttribute('tabindex', tabindex);
    } else {
      element.removeAttribute('tabindex');
    }
  });
}