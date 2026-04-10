"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FloatingRootStore = void 0;
var _store = require("@base-ui/utils/store");
var _createEventEmitter = require("../utils/createEventEmitter");
var _utils = require("../utils");
const selectors = {
  open: (0, _store.createSelector)(state => state.open),
  domReferenceElement: (0, _store.createSelector)(state => state.domReferenceElement),
  referenceElement: (0, _store.createSelector)(state => state.positionReference ?? state.referenceElement),
  floatingElement: (0, _store.createSelector)(state => state.floatingElement),
  floatingId: (0, _store.createSelector)(state => state.floatingId)
};
class FloatingRootStore extends _store.ReactStore {
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
      events: (0, _createEventEmitter.createEventEmitter)(),
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
    (0, _utils.isClickLikeEvent)(eventDetails.event)) {
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
exports.FloatingRootStore = FloatingRootStore;