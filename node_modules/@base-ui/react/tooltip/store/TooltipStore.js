"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TooltipStore = void 0;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _store = require("@base-ui/utils/store");
var _useRefWithInit = require("@base-ui/utils/useRefWithInit");
var _floatingUiReact = require("../../floating-ui-react");
var _reasons = require("../../utils/reasons");
var _popups = require("../../utils/popups");
const selectors = {
  ..._popups.popupStoreSelectors,
  disabled: (0, _store.createSelector)(state => state.disabled),
  instantType: (0, _store.createSelector)(state => state.instantType),
  isInstantPhase: (0, _store.createSelector)(state => state.isInstantPhase),
  trackCursorAxis: (0, _store.createSelector)(state => state.trackCursorAxis),
  disableHoverablePopup: (0, _store.createSelector)(state => state.disableHoverablePopup),
  lastOpenChangeReason: (0, _store.createSelector)(state => state.openChangeReason),
  closeOnClick: (0, _store.createSelector)(state => state.closeOnClick),
  closeDelay: (0, _store.createSelector)(state => state.closeDelay),
  hasViewport: (0, _store.createSelector)(state => state.hasViewport)
};
class TooltipStore extends _store.ReactStore {
  constructor(initialState) {
    super({
      ...createInitialState(),
      ...initialState
    }, {
      popupRef: /*#__PURE__*/React.createRef(),
      onOpenChange: undefined,
      onOpenChangeComplete: undefined,
      triggerElements: new _popups.PopupTriggerMap()
    }, selectors);
  }
  setOpen = (nextOpen, eventDetails) => {
    const reason = eventDetails.reason;
    const isHover = reason === _reasons.REASONS.triggerHover;
    const isFocusOpen = nextOpen && reason === _reasons.REASONS.triggerFocus;
    const isDismissClose = !nextOpen && (reason === _reasons.REASONS.triggerPress || reason === _reasons.REASONS.escapeKey);
    eventDetails.preventUnmountOnClose = () => {
      this.set('preventUnmountingOnClose', true);
    };
    this.context.onOpenChange?.(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    const changeState = () => {
      const updatedState = {
        open: nextOpen,
        openChangeReason: reason
      };
      if (isFocusOpen) {
        updatedState.instantType = 'focus';
      } else if (isDismissClose) {
        updatedState.instantType = 'dismiss';
      } else if (reason === _reasons.REASONS.triggerHover) {
        updatedState.instantType = undefined;
      }

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
      // If a hover reason is provided, we need to flush the state synchronously. This ensures
      // `node.getAnimations()` knows about the new state.
      ReactDOM.flushSync(changeState);
    } else {
      changeState();
    }
  };
  static useStore(externalStore, initialState) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const internalStore = (0, _useRefWithInit.useRefWithInit)(() => {
      return new TooltipStore(initialState);
    }).current;
    const store = externalStore ?? internalStore;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const floatingRootContext = (0, _floatingUiReact.useSyncedFloatingRootContext)({
      popupStore: store,
      onOpenChange: store.setOpen
    });

    // It's safe to set this here because when this code runs for the first time,
    // nothing has had a chance to subscribe to the `store` yet.
    // For subsequent renders, the `floatingRootContext` reference remains the same,
    // so it's basically a no-op.
    store.state.floatingRootContext = floatingRootContext;
    return store;
  }
}
exports.TooltipStore = TooltipStore;
function createInitialState() {
  return {
    ...(0, _popups.createInitialPopupStoreState)(),
    disabled: false,
    instantType: undefined,
    isInstantPhase: false,
    trackCursorAxis: 'none',
    disableHoverablePopup: false,
    openChangeReason: null,
    closeOnClick: true,
    closeDelay: 0,
    hasViewport: false
  };
}