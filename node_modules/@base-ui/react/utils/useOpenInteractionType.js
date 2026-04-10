"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useOpenInteractionType = useOpenInteractionType;
var React = _interopRequireWildcard(require("react"));
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useEnhancedClickHandler = require("@base-ui/utils/useEnhancedClickHandler");
var _detectBrowser = require("@base-ui/utils/detectBrowser");
var _useValueChanged = require("./useValueChanged");
/**
 * Determines the interaction type (keyboard, mouse, touch, etc.) that opened the component.
 *
 * @param open The open state of the component.
 */
function useOpenInteractionType(open) {
  const [openMethod, setOpenMethod] = React.useState(null);
  const handleTriggerClick = (0, _useStableCallback.useStableCallback)((_, interactionType) => {
    if (!open) {
      setOpenMethod(interactionType || (
      // On iOS Safari, the hitslop around touch targets means tapping outside an element's
      // bounds does not fire `pointerdown` but does fire `mousedown`. The `interactionType`
      // will be "" in that case.
      _detectBrowser.isIOS ? 'touch' : ''));
    }
  });
  (0, _useValueChanged.useValueChanged)(open, previousOpen => {
    if (previousOpen && !open) {
      setOpenMethod(null);
    }
  });
  const {
    onClick,
    onPointerDown
  } = (0, _useEnhancedClickHandler.useEnhancedClickHandler)(handleTriggerClick);
  return React.useMemo(() => ({
    openMethod,
    triggerProps: {
      onClick,
      onPointerDown
    }
  }), [openMethod, onClick, onPointerDown]);
}