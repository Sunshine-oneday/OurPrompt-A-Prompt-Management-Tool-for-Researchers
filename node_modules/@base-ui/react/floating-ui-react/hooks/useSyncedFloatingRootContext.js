"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSyncedFloatingRootContext = useSyncedFloatingRootContext;
var _useId = require("@base-ui/utils/useId");
var _useRefWithInit = require("@base-ui/utils/useRefWithInit");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _dom = require("@floating-ui/utils/dom");
var _FloatingTree = require("../components/FloatingTree");
var _FloatingRootStore = require("../components/FloatingRootStore");
/**
 * Initializes a FloatingRootStore that is kept in sync with the provided PopupStore.
 * The new instance is created only once and updated on every render.
 */
function useSyncedFloatingRootContext(options) {
  const {
    popupStore,
    noEmit = false,
    treatPopupAsFloatingElement = false,
    onOpenChange
  } = options;
  const floatingId = (0, _useId.useId)();
  const nested = (0, _FloatingTree.useFloatingParentNodeId)() != null;
  const open = popupStore.useState('open');
  const referenceElement = popupStore.useState('activeTriggerElement');
  const floatingElement = popupStore.useState(treatPopupAsFloatingElement ? 'popupElement' : 'positionerElement');
  const triggerElements = popupStore.context.triggerElements;
  const store = (0, _useRefWithInit.useRefWithInit)(() => new _FloatingRootStore.FloatingRootStore({
    open,
    referenceElement,
    floatingElement,
    triggerElements,
    onOpenChange,
    floatingId,
    nested,
    noEmit
  })).current;
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    const valuesToSync = {
      open,
      floatingId,
      referenceElement,
      floatingElement
    };
    if ((0, _dom.isElement)(referenceElement)) {
      valuesToSync.domReferenceElement = referenceElement;
    }
    if (store.state.positionReference === store.state.referenceElement) {
      valuesToSync.positionReference = referenceElement;
    }
    store.update(valuesToSync);
  }, [open, floatingId, referenceElement, floatingElement, store]);

  // TODO: When `setOpen` is a part of the PopupStore API, we don't need to sync it.
  store.context.onOpenChange = onOpenChange;
  store.context.nested = nested;
  store.context.noEmit = noEmit;
  return store;
}