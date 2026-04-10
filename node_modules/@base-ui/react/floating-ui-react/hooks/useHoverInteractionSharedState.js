"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HoverInteraction = void 0;
exports.applySafePolygonPointerEventsMutation = applySafePolygonPointerEventsMutation;
exports.clearSafePolygonPointerEventsMutation = clearSafePolygonPointerEventsMutation;
exports.isInteractiveElement = isInteractiveElement;
exports.useHoverInteractionSharedState = useHoverInteractionSharedState;
var _useOnMount = require("@base-ui/utils/useOnMount");
var _useRefWithInit = require("@base-ui/utils/useRefWithInit");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _constants = require("../utils/constants");
const interactiveSelector = `button,a,[role="button"],select,[tabindex]:not([tabindex="-1"]),${_constants.TYPEABLE_SELECTOR}`;
function isInteractiveElement(element) {
  return element ? Boolean(element.closest(interactiveSelector)) : false;
}
class HoverInteraction {
  constructor() {
    this.pointerType = undefined;
    this.interactedInside = false;
    this.handler = undefined;
    this.blockMouseMove = true;
    this.performedPointerEventsMutation = false;
    this.pointerEventsScopeElement = null;
    this.pointerEventsReferenceElement = null;
    this.pointerEventsFloatingElement = null;
    this.restTimeoutPending = false;
    this.openChangeTimeout = new _useTimeout.Timeout();
    this.restTimeout = new _useTimeout.Timeout();
    this.handleCloseOptions = undefined;
  }
  static create() {
    return new HoverInteraction();
  }
  dispose = () => {
    this.openChangeTimeout.clear();
    this.restTimeout.clear();
  };
  disposeEffect = () => {
    return this.dispose;
  };
}
exports.HoverInteraction = HoverInteraction;
function clearSafePolygonPointerEventsMutation(instance) {
  if (!instance.performedPointerEventsMutation) {
    return;
  }
  instance.pointerEventsScopeElement?.style.removeProperty('pointer-events');
  instance.pointerEventsReferenceElement?.style.removeProperty('pointer-events');
  instance.pointerEventsFloatingElement?.style.removeProperty('pointer-events');
  instance.performedPointerEventsMutation = false;
  instance.pointerEventsScopeElement = null;
  instance.pointerEventsReferenceElement = null;
  instance.pointerEventsFloatingElement = null;
}
function applySafePolygonPointerEventsMutation(instance, options) {
  const {
    scopeElement,
    referenceElement,
    floatingElement
  } = options;
  clearSafePolygonPointerEventsMutation(instance);
  instance.performedPointerEventsMutation = true;
  instance.pointerEventsScopeElement = scopeElement;
  instance.pointerEventsReferenceElement = referenceElement;
  instance.pointerEventsFloatingElement = floatingElement;
  scopeElement.style.pointerEvents = 'none';
  referenceElement.style.pointerEvents = 'auto';
  floatingElement.style.pointerEvents = 'auto';
}
function useHoverInteractionSharedState(store) {
  const instance = (0, _useRefWithInit.useRefWithInit)(HoverInteraction.create).current;
  const data = store.context.dataRef.current;
  if (!data.hoverInteractionState) {
    data.hoverInteractionState = instance;
  }
  (0, _useOnMount.useOnMount)(data.hoverInteractionState.disposeEffect);
  return data.hoverInteractionState;
}