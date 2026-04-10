import { createSelector } from '@base-ui/utils/store';
import { compareItemEquality } from "../utils/itemEquality.js";
import { hasNullItemLabel } from "../utils/resolveValueLabel.js";
export const selectors = {
  id: createSelector(state => state.id),
  labelId: createSelector(state => state.labelId),
  query: createSelector(state => state.query),
  items: createSelector(state => state.items),
  selectedValue: createSelector(state => state.selectedValue),
  hasSelectionChips: createSelector(state => {
    const selectedValue = state.selectedValue;
    return Array.isArray(selectedValue) && selectedValue.length > 0;
  }),
  hasSelectedValue: createSelector(state => {
    const {
      selectedValue,
      selectionMode
    } = state;
    if (selectedValue == null) {
      return false;
    }
    if (selectionMode === 'multiple' && Array.isArray(selectedValue)) {
      return selectedValue.length > 0;
    }
    return true;
  }),
  hasNullItemLabel: createSelector((state, enabled) => {
    return enabled ? hasNullItemLabel(state.items) : false;
  }),
  open: createSelector(state => state.open),
  mounted: createSelector(state => state.mounted),
  forceMounted: createSelector(state => state.forceMounted),
  inline: createSelector(state => state.inline),
  activeIndex: createSelector(state => state.activeIndex),
  selectedIndex: createSelector(state => state.selectedIndex),
  isActive: createSelector((state, index) => state.activeIndex === index),
  isSelected: createSelector((state, itemValue) => {
    const comparer = state.isItemEqualToValue;
    const selectedValue = state.selectedValue;
    if (Array.isArray(selectedValue)) {
      return selectedValue.some(selectedItem => compareItemEquality(itemValue, selectedItem, comparer));
    }
    return compareItemEquality(itemValue, selectedValue, comparer);
  }),
  transitionStatus: createSelector(state => state.transitionStatus),
  popupProps: createSelector(state => state.popupProps),
  inputProps: createSelector(state => state.inputProps),
  triggerProps: createSelector(state => state.triggerProps),
  getItemProps: createSelector(state => state.getItemProps),
  positionerElement: createSelector(state => state.positionerElement),
  listElement: createSelector(state => state.listElement),
  triggerElement: createSelector(state => state.triggerElement),
  inputElement: createSelector(state => state.inputElement),
  inputGroupElement: createSelector(state => state.inputGroupElement),
  popupSide: createSelector(state => state.popupSide),
  openMethod: createSelector(state => state.openMethod),
  inputInsidePopup: createSelector(state => state.inputInsidePopup),
  selectionMode: createSelector(state => state.selectionMode),
  listRef: createSelector(state => state.listRef),
  labelsRef: createSelector(state => state.labelsRef),
  popupRef: createSelector(state => state.popupRef),
  emptyRef: createSelector(state => state.emptyRef),
  inputRef: createSelector(state => state.inputRef),
  keyboardActiveRef: createSelector(state => state.keyboardActiveRef),
  chipsContainerRef: createSelector(state => state.chipsContainerRef),
  clearRef: createSelector(state => state.clearRef),
  valuesRef: createSelector(state => state.valuesRef),
  allValuesRef: createSelector(state => state.allValuesRef),
  name: createSelector(state => state.name),
  disabled: createSelector(state => state.disabled),
  readOnly: createSelector(state => state.readOnly),
  required: createSelector(state => state.required),
  grid: createSelector(state => state.grid),
  isGrouped: createSelector(state => state.isGrouped),
  virtualized: createSelector(state => state.virtualized),
  onOpenChangeComplete: createSelector(state => state.onOpenChangeComplete),
  openOnInputClick: createSelector(state => state.openOnInputClick),
  itemToStringLabel: createSelector(state => state.itemToStringLabel),
  isItemEqualToValue: createSelector(state => state.isItemEqualToValue),
  modal: createSelector(state => state.modal),
  autoHighlight: createSelector(state => state.autoHighlight),
  submitOnItemClick: createSelector(state => state.submitOnItemClick)
};