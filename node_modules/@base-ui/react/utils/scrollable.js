"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findScrollableTouchTarget = findScrollableTouchTarget;
exports.hasScrollableAncestor = hasScrollableAncestor;
exports.isScrollable = isScrollable;
var _dom = require("@floating-ui/utils/dom");
function isScrollable(element, axis) {
  const style = (0, _dom.getComputedStyle)(element);
  if (axis === 'vertical') {
    const overflowY = style.overflowY;
    return (overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight;
  }
  const overflowX = style.overflowX;
  return (overflowX === 'auto' || overflowX === 'scroll') && element.scrollWidth > element.clientWidth;
}
function hasScrollableAncestor(target, root, axes) {
  let node = target;
  while (node && node !== root) {
    for (const axis of axes) {
      if (isScrollable(node, axis)) {
        return true;
      }
    }
    node = node.parentElement;
  }
  return false;
}
function findScrollableTouchTarget(target, root, axis = 'vertical') {
  let node = (0, _dom.isHTMLElement)(target) ? target : null;
  while (node && node !== root) {
    if (isScrollable(node, axis)) {
      return node;
    }
    node = node.parentElement;
  }
  return isScrollable(root, axis) ? root : null;
}