import * as React from 'react';
import { createSelector, ReactStore } from '@base-ui/utils/store';
import { createInitialPopupStoreState, popupStoreSelectors, PopupTriggerMap } from "../../utils/popups/index.js";
const selectors = {
  ...popupStoreSelectors,
  modal: createSelector(state => state.modal),
  nested: createSelector(state => state.nested),
  nestedOpenDialogCount: createSelector(state => state.nestedOpenDialogCount),
  disablePointerDismissal: createSelector(state => state.disablePointerDismissal),
  openMethod: createSelector(state => state.openMethod),
  descriptionElementId: createSelector(state => state.descriptionElementId),
  titleElementId: createSelector(state => state.titleElementId),
  viewportElement: createSelector(state => state.viewportElement),
  role: createSelector(state => state.role)
};
export class DialogStore extends ReactStore {
  constructor(initialState) {
    super(createInitialState(initialState), {
      popupRef: /*#__PURE__*/React.createRef(),
      backdropRef: /*#__PURE__*/React.createRef(),
      internalBackdropRef: /*#__PURE__*/React.createRef(),
      outsidePressEnabledRef: {
        current: true
      },
      triggerElements: new PopupTriggerMap(),
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
function createInitialState(initialState = {}) {
  return {
    ...createInitialPopupStoreState(),
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