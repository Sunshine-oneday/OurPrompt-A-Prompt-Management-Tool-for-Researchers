"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isOutsideMenuEvent = isOutsideMenuEvent;
var _utils = require("../../floating-ui-react/utils");
function isOutsideMenuEvent({
  currentTarget,
  relatedTarget
}, params) {
  const {
    popupElement,
    viewportElement,
    rootRef,
    tree,
    nodeId
  } = params;
  const nodeChildrenContains = tree ? (0, _utils.getNodeChildren)(tree.nodesRef.current, nodeId).some(node => (0, _utils.contains)(node.context?.elements.floating, relatedTarget)) : [];

  // For nested scenarios without popupElement, we need to be more lenient
  // and only close if we're definitely outside the root
  if (!popupElement) {
    return !(0, _utils.contains)(rootRef.current, relatedTarget) && !nodeChildrenContains;
  }

  // Use popupElement as the primary floating element, but fall back to viewportElement if needed
  const floatingElement = popupElement || viewportElement;
  return !(0, _utils.contains)(floatingElement, currentTarget) && !(0, _utils.contains)(floatingElement, relatedTarget) && !(0, _utils.contains)(rootRef.current, relatedTarget) && !nodeChildrenContains && !((0, _utils.contains)(floatingElement, relatedTarget) && relatedTarget?.hasAttribute('data-base-ui-focus-guard'));
}