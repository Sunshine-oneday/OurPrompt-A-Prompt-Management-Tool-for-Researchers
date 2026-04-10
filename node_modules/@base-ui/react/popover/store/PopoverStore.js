"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PopoverStore = void 0;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _store = require("@base-ui/utils/store");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _useRefWithInit = require("@base-ui/utils/useRefWithInit");
var _useOnMount = require("@base-ui/utils/useOnMount");
var _reasons = require("../../utils/reasons");
var _popups = require("../../utils/popups");
var _constants = require("../../utils/constants");
/* eslint-disable react-hooks/rules-of-hooks */

function createInitialState() {
  return {
    ...(0, _popups.createInitialPopupStoreState)(),
    disabled: false,
    modal: false,
    instantType: undefined,
    openMethod: null,
    openChangeReason: null,
    titleElementId: undefined,
    descriptionElementId: undefined,
    stickIfOpen: true,
    nested: false,
    openOnHover: false,
    closeDelay: 0,
    hasViewport: false
  };
}
const selectors = {
  ..._popups.popupStoreSelectors,
  disabled: (0, _store.createSelector)(state => state.disabled),
  instantType: (0, _store.createSelector)(state => state.instantType),
  openMethod: (0, _store.createSelector)(state => state.openMethod),
  openChangeReason: (0, _store.createSelector)(state => state.openChangeReason),
  modal: (0, _store.createSelector)(state => state.modal),
  stickIfOpen: (0, _store.createSelector)(state => state.stickIfOpen),
  titleElementId: (0, _store.createSelector)(state => state.titleElementId),
  descriptionElementId: (0, _store.createSelector)(state => state.descriptionElementId),
  openOnHover: (0, _store.createSelector)(state => state.openOnHover),
  closeDelay: (0, _store.createSelector)(state => state.closeDelay),
  hasViewport: (0, _store.createSelector)(state => state.hasViewport)
};
class PopoverStore extends _store.ReactStore {
  constructor(initialState) {
    const initial = {
      ...createInitialState(),
      ...initialState
    };
    if (initial.open && initialState?.mounted === undefined) {
      initial.mounted = true;
    }
    super(initial, {
      popupRef: /*#__PURE__*/React.createRef(),
      backdropRef: /*#__PURE__*/React.createRef(),
      internalBackdropRef: /*#__PURE__*/React.createRef(),
      onOpenChange: undefined,
      onOpenChangeComplete: undefined,
      triggerFocusTargetRef: /*#__PURE__*/React.createRef(),
      beforeContentFocusGuardRef: /*#__PURE__*/React.createRef(),
      stickIfOpenTimeout: new _useTimeout.Timeout(),
      triggerElements: new _popups.PopupTriggerMap()
    }, selectors);
  }
  setOpen = (nextOpen, eventDetails) => {
    const isHover = eventDetails.reason === _reasons.REASONS.triggerHover;
    const isKeyboardClick = eventDetails.reason === _reasons.REASONS.triggerPress && eventDetails.event.detail === 0;
    const isDismissClose = !nextOpen && (eventDetails.reason === _reasons.REASONS.escapeKey || eventDetails.reason == null);
    eventDetails.preventUnmountOnClose = () => {
      this.set('preventUnmountingOnClose', true);
    };
    this.context.onOpenChange?.(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    const details = {
      open: nextOpen,
      nativeEvent: eventDetails.event,
      reason: eventDetails.reason,
      nested: this.state.nested,
      triggerElement: eventDetails.trigger
    };
    const floatingEvents = this.state.floatingRootContext.context.events;
    floatingEvents?.emit('openchange', details);
    const changeState = () => {
      const updatedState = {
        open: nextOpen,
        openChangeReason: eventDetails.reason
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
    if (isHover) {
      // Only allow "patient" clicks to close the popover if it's open.
      // If they clicked within 500ms of the popover opening, keep it open.
      this.set('stickIfOpen', true);
      this.context.stickIfOpenTimeout.start(_constants.PATIENT_CLICK_THRESHOLD, () => {
        this.set('stickIfOpen', false);
      });
      ReactDOM.flushSync(changeState);
    } else {
      changeState();
    }
    if (isKeyboardClick || isDismissClose) {
      this.set('instantType', isKeyboardClick ? 'click' : 'dismiss');
    } else if (eventDetails.reason === _reasons.REASONS.focusOut) {
      this.set('instantType', 'focus');
    } else {
      this.set('instantType', undefined);
    }
  };
  static useStore(externalStore, initialState) {
    const internalStore = (0, _useRefWithInit.useRefWithInit)(() => {
      return new PopoverStore(initialState);
    }).current;
    const store = externalStore ?? internalStore;
    (0, _useOnMount.useOnMount)(internalStore.disposeEffect);
    return store;
  }
  disposeEffect = () => {
    return this.context.stickIfOpenTimeout.disposeEffect();
  };
}
exports.PopoverStore = PopoverStore;