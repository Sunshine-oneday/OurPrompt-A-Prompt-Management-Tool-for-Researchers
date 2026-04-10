/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ReactStore, createSelector } from '@base-ui/utils/store';
import { Timeout } from '@base-ui/utils/useTimeout';
import { useRefWithInit } from '@base-ui/utils/useRefWithInit';
import { useOnMount } from '@base-ui/utils/useOnMount';
import { REASONS } from "../../utils/reasons.js";
import { createInitialPopupStoreState, popupStoreSelectors, PopupTriggerMap } from "../../utils/popups/index.js";
import { PATIENT_CLICK_THRESHOLD } from "../../utils/constants.js";
function createInitialState() {
  return {
    ...createInitialPopupStoreState(),
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
  ...popupStoreSelectors,
  disabled: createSelector(state => state.disabled),
  instantType: createSelector(state => state.instantType),
  openMethod: createSelector(state => state.openMethod),
  openChangeReason: createSelector(state => state.openChangeReason),
  modal: createSelector(state => state.modal),
  stickIfOpen: createSelector(state => state.stickIfOpen),
  titleElementId: createSelector(state => state.titleElementId),
  descriptionElementId: createSelector(state => state.descriptionElementId),
  openOnHover: createSelector(state => state.openOnHover),
  closeDelay: createSelector(state => state.closeDelay),
  hasViewport: createSelector(state => state.hasViewport)
};
export class PopoverStore extends ReactStore {
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
      stickIfOpenTimeout: new Timeout(),
      triggerElements: new PopupTriggerMap()
    }, selectors);
  }
  setOpen = (nextOpen, eventDetails) => {
    const isHover = eventDetails.reason === REASONS.triggerHover;
    const isKeyboardClick = eventDetails.reason === REASONS.triggerPress && eventDetails.event.detail === 0;
    const isDismissClose = !nextOpen && (eventDetails.reason === REASONS.escapeKey || eventDetails.reason == null);
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
      this.context.stickIfOpenTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
        this.set('stickIfOpen', false);
      });
      ReactDOM.flushSync(changeState);
    } else {
      changeState();
    }
    if (isKeyboardClick || isDismissClose) {
      this.set('instantType', isKeyboardClick ? 'click' : 'dismiss');
    } else if (eventDetails.reason === REASONS.focusOut) {
      this.set('instantType', 'focus');
    } else {
      this.set('instantType', undefined);
    }
  };
  static useStore(externalStore, initialState) {
    const internalStore = useRefWithInit(() => {
      return new PopoverStore(initialState);
    }).current;
    const store = externalStore ?? internalStore;
    useOnMount(internalStore.disposeEffect);
    return store;
  }
  disposeEffect = () => {
    return this.context.stickIfOpenTimeout.disposeEffect();
  };
}