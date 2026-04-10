"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DialogStore = void 0;
var React = _interopRequireWildcard(require("react"));
var _store = require("@base-ui/utils/store");
var _popups = require("../../utils/popups");
const selectors = {
  ..._popups.popupStoreSelectors,
  modal: (0, _store.createSelector)(state => state.modal),
  nested: (0, _store.createSelector)(state => state.nested),
  nestedOpenDialogCount: (0, _store.createSelector)(state => state.nestedOpenDialogCount),
  disablePointerDismissal: (0, _store.createSelector)(state => state.disablePointerDismissal),
  openMethod: (0, _store.createSelector)(state => state.openMethod),
  descriptionElementId: (0, _store.createSelector)(state => state.descriptionElementId),
  titleElementId: (0, _store.createSelector)(state => state.titleElementId),
  viewportElement: (0, _store.createSelector)(state => state.viewportElement),
  role: (0, _store.createSelector)(state => state.role)
};
class DialogStore extends _store.ReactStore {
  constructor(initialState) {
    super(createInitialState(initialState), {
      popupRef: /*#__PURE__*/React.createRef(),
      backdropRef: /*#__PURE__*/React.createRef(),
      internalBackdropRef: /*#__PURE__*/React.createRef(),
      outsidePressEnabledRef: {
        current: true
      },
      triggerElements: new _popups.PopupTriggerMap(),
      onOpenChange: undefined,
      onOpenChangeComplete: undefined
    }, selectors);
  }
  setOpen = (nextOpen, eventDetails) => {
    eventDetails.preventUnmountOnClose = () => {
      this.set('preventUnmountingOnClose', true);
    };
    if (!nextOpen && eventDetails.trigger == null && this.state.activeTriggerId != null) {
      // When closing the dialog, pass the old trigger to the onOpenChange event
      // so it's not reset too early (potentially causing focus issues in controlled scenarios).
      eventDetails.trigger = this.state.activeTriggerElement ?? undefined;
    }
    this.context.onOpenChange?.(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    const details = {
      open: nextOpen,
      nativeEvent: eventDetails.event,
      reason: eventDetails.reason,
      nested: this.state.nested
    };
    this.state.floatingRootContext.context.events?.emit('openchange', details);
    const updatedState = {
      open: nextOpen
    };

    // If a popup is closing, the `trigger` may be null.
    // We want to keep the previous value so that exit animations are played and focus is returned correctly.
    const newTriggerId = eventDetails.trigger?.id ?? null;
    if (newTriggerId || nextOpen) {
      updatedState.activeTriggerId = newTriggerId;
      updatedState.activeTriggerElement = eventDetails.trigger ?? null;
    }
    this.update(updatedState);
  };
}
exports.DialogStore = DialogStore;
function createInitialState(initialState = {}) {
  return {
    ...(0, _popups.createInitialPopupStoreState)(),
    modal: true,
    disablePointerDismissal: false,
    popupElement: null,
    viewportElement: null,
    descriptionElementId: undefined,
    titleElementId: undefined,
    openMethod: null,
    nested: false,
    nestedOpenDialogCount: 0,
    role: 'dialog',
    ...initialState
  };
}