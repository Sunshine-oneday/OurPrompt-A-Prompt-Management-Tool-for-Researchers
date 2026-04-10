"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInitialPopupStoreState = createInitialPopupStoreState;
exports.popupStoreSelectors = void 0;
var _store = require("@base-ui/utils/store");
var _getEmptyRootContext = require("../../floating-ui-react/utils/getEmptyRootContext");
var _constants = require("../constants");
/**
 * State common to all popup stores.
 */

function createInitialPopupStoreState() {
  return {
    open: false,
    openProp: undefined,
    mounted: false,
    transitionStatus: 'idle',
    floatingRootContext: (0, _getEmptyRootContext.getEmptyRootContext)(),
    preventUnmountingOnClose: false,
    payload: undefined,
    activeTriggerId: null,
    activeTriggerElement: null,
    triggerIdProp: undefined,
    popupElement: null,
    positionerElement: null,
    activeTriggerProps: _constants.EMPTY_OBJECT,
    inactiveTriggerProps: _constants.EMPTY_OBJECT,
    popupProps: _constants.EMPTY_OBJECT
  };
}
const activeTriggerIdSelector = (0, _store.createSelector)(state => state.triggerIdProp ?? state.activeTriggerId);
const popupStoreSelectors = exports.popupStoreSelectors = {
  open: (0, _store.createSelector)(state => state.openProp ?? state.open),
  mounted: (0, _store.createSelector)(state => state.mounted),
  transitionStatus: (0, _store.createSelector)(state => state.transitionStatus),
  floatingRootContext: (0, _store.createSelector)(state => state.floatingRootContext),
  preventUnmountingOnClose: (0, _store.createSelector)(state => state.preventUnmountingOnClose),
  payload: (0, _store.createSelector)(state => state.payload),
  activeTriggerId: activeTriggerIdSelector,
  activeTriggerElement: (0, _store.createSelector)(state => state.mounted ? state.activeTriggerElement : null),
  /**
   * Whether the trigger with the given ID was used to open the popup.
   */
  isTriggerActive: (0, _store.createSelector)((state, triggerId) => triggerId !== undefined && activeTriggerIdSelector(state) === triggerId),
  /**
   * Whether the popup is open and was activated by a trigger with the given ID.
   */
  isOpenedByTrigger: (0, _store.createSelector)((state, triggerId) => triggerId !== undefined && activeTriggerIdSelector(state) === triggerId && state.open),
  /**
   * Whether the popup is mounted and was activated by a trigger with the given ID.
   */
  isMountedByTrigger: (0, _store.createSelector)((state, triggerId) => triggerId !== undefined && activeTriggerIdSelector(state) === triggerId && state.mounted),
  triggerProps: (0, _store.createSelector)((state, isActive) => isActive ? state.activeTriggerProps : state.inactiveTriggerProps),
  popupProps: (0, _store.createSelector)(state => state.popupProps),
  popupElement: (0, _store.createSelector)(state => state.popupElement),
  positionerElement: (0, _store.createSelector)(state => state.positionerElement)
};