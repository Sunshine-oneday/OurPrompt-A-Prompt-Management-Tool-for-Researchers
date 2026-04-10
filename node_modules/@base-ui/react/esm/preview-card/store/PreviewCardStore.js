import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createSelector, ReactStore } from '@base-ui/utils/store';
import { useRefWithInit } from '@base-ui/utils/useRefWithInit';
import { createInitialPopupStoreState, popupStoreSelectors, PopupTriggerMap } from "../../utils/popups/index.js";
import { useSyncedFloatingRootContext } from "../../floating-ui-react/index.js";
import { REASONS } from "../../utils/reasons.js";
import { CLOSE_DELAY } from "../utils/constants.js";
const selectors = {
  ...popupStoreSelectors,
  instantType: createSelector(state => state.instantType),
  hasViewport: createSelector(state => state.hasViewport)
};
export class PreviewCardStore extends ReactStore {
  constructor(initialState) {
    super({
      ...createInitialState(),
      ...initialState
    }, {
      popupRef: /*#__PURE__*/React.createRef(),
      onOpenChange: undefined,
      onOpenChangeComplete: undefined,
      triggerElements: new PopupTriggerMap(),
      closeDelayRef: {
        current: CLOSE_DELAY
      }
    }, selectors);
  }
  setOpen = (nextOpen, eventDetails) => {
    const reason = eventDetails.reason;
    const isHover = reason === REASONS.triggerHover;
    const isFocusOpen = nextOpen && reason === REASONS.triggerFocus;
    const isDismissClose = !nextOpen && (reason === REASONS.triggerPress || reason === REASONS.escapeKey);
    eventDetails.preventUnmountOnClose = () => {
      this.set('preventUnmountingOnClose', true);
    };
    this.context.onOpenChange?.(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    const changeState = () => {
      const updatedState = {
        open: nextOpen
      };
      if (isFocusOpen) {
        updatedState.instantType = 'focus';
      } else if (isDismissClose) {
        updatedState.instantType = 'dismiss';
      } else if (reason === REASONS.triggerHover) {
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
    const internalStore = useRefWithInit(() => {
      return new PreviewCardStore(initialState);
    }).current;
    const store = externalStore ?? internalStore;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const floatingRootContext = useSyncedFloatingRootContext({
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
function createInitialState() {
  return {
    ...createInitialPopupStoreState(),
    instantType: undefined,
    hasViewport: false
  };
}