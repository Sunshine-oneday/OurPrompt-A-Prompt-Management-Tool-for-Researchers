import { createSelector } from '@base-ui/utils/store';
import { compareItemEquality } from "../utils/itemEquality.js";
import { hasNullItemLabel, stringifyAsValue } from "../utils/resolveValueLabel.js";
export const selectors = {
  id: createSelector(state => state.id),
  labelId: createSelector(state => state.labelId),
  modal: createSelector(state => state.modal),
  multiple: createSelector(state => state.multiple),
  items: createSelector(state => state.items),
  itemToStringLabel: createSelector(state => state.itemToStringLabel),
  itemToStringValue: createSelector(state => state.itemToStringValue),
  isItemEqualToValue: createSelector(state => state.isItemEqualToValue),
  value: createSelector(state => state.value),
  hasSelectedValue: createSelector(state => {
    const {
      value,
      multiple,
      itemToStringValue
    } = state;
    if (value == null) {
      return false;
    }
    if (multiple && Array.isArray(value)) {
      return value.length > 0;
    }
    return stringifyAsValue(value, itemToStringValue) !== '';
  }),
  hasNullItemLabel: createSelector((state, enabled) => {
    return enabled ? hasNullItemLabel(state.items) : false;
  }),
  open: createSelector(state => state.open),
  mounted: createSelector(state => state.mounted),
  forceMount: createSelector(state => state.forceMount),
  transitionStatus: createSelector(state => state.transitionStatus),
  openMethod: createSelector(state => state.openMethod),
  activeIndex: createSelector(state => state.activeIndex),
  selectedIndex: createSelector(state => state.selectedIndex),
  isActive: createSelector((state, index) => state.activeIndex === index),
  isSelected: createSelector((state, index, itemValue) => {
    const comparer = state.isItemEqualToValue;
    const storeValue = state.value;
    if (state.multiple) {
      return Array.isArray(storeValue) && storeValue.some(selectedItem => compareItemEquality(itemValue, selectedItem, comparer));
    }

    // `selectedIndex` is only updated after the items mount for the first time,
    // the value check avoids a re-render for the initially selected item.
    if (state.selectedIndex === index && state.selectedIndex !== null) {
      return true;
    }
    return compareItemEquality(itemValue, storeValue, comparer);
  }),
  isSelectedByFocus: createSelector((state, index) => {
    return state.selectedIndex === index;
  }),
  popupProps: createSelector(state => state.popupProps),
  triggerProps: createSelector(state => state.triggerProps),
  triggerElement: createSelector(state => state.triggerElement),
  positionerElement: createSelector(state => state.positionerElement),
  listElement: createSelector(state => state.listElement),
  scrollUpArrowVisible: createSelector(state => state.scrollUpArrowVisible),
  scrollDownArrowVisible: createSelector(state => state.scrollDownArrowVisible),
  hasScrollArrows: createSelector(state => state.hasScrollArrows)
};