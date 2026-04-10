import { createSelector, ReactStore } from '@base-ui/utils/store';
import { createEventEmitter } from "../utils/createEventEmitter.js";
import { isClickLikeEvent } from "../utils.js";
const selectors = {
  open: createSelector(state => state.open),
  domReferenceElement: createSelector(state => state.domReferenceElement),
  referenceElement: createSelector(state => state.positionReference ?? state.referenceElement),
  floatingElement: createSelector(state => state.floatingElement),
  floatingId: createSelector(state => state.floatingId)
};
export class FloatingRootStore extends ReactStore {
  constructor(options) {
    const {
      nested,
      noEmit,
      onOpenChange,
      triggerElements,
      ...initialState
    } = options;
    super({
      ...initialState,
      positionReference: initialState.referenceElement,
      domReferenceElement: initialState.referenceElement
    }, {
      onOpenChange,
      dataRef: {
        current: {}
      },
      events: createEventEmitter(),
      nested,
      noEmit,
      triggerElements
    }, selectors);
  }

  /**
   * Emits the `openchange` event through the internal event emitter and calls the `onOpenChange` handler with the provided arguments.
   *
   * @param newOpen The new open state.
   * @param eventDetails Details about the event that triggered the open state change.
   */
  setOpen = (newOpen, eventDetails) => {
    if (!newOpen || !this.state.open ||
    // Prevent a pending hover-open from overwriting a click-open event, while allowing
    // click events to upgrade a hover-open.
    isClickLikeEvent(eventDetails.event)) {
      this.context.dataRef.current.openEvent = newOpen ? eventDetails.event : undefined;
    }
    if (!this.context.noEmit) {
      const details = {
        open: newOpen,
        reason: eventDetails.reason,
        nativeEvent: eventDetails.event,
        nested: this.context.nested,
        triggerElement: eventDetails.trigger
      };
      this.context.events.emit('openchange', details);
    }
    this.context.onOpenChange?.(newOpen, eventDetails);
  };
}