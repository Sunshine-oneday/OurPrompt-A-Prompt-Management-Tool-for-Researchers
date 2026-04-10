"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEmptyRootContext = getEmptyRootContext;
var _popups = require("../../utils/popups");
var _FloatingRootStore = require("../components/FloatingRootStore");
function getEmptyRootContext() {
  return new _FloatingRootStore.FloatingRootStore({
    open: false,
    floatingElement: null,
    referenceElement: null,
    triggerElements: new _popups.PopupTriggerMap(),
    floatingId: '',
    nested: false,
    noEmit: false,
    onOpenChange: undefined
  });
}