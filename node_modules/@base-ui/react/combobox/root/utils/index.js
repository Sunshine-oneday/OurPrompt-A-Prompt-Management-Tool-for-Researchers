"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCollatorItemFilter = createCollatorItemFilter;
exports.createSingleSelectionCollatorFilter = createSingleSelectionCollatorFilter;
var _resolveValueLabel = require("../../../utils/resolveValueLabel");
/**
 * Enhanced filter using Intl.Collator for more robust string matching.
 * Uses the provided `itemToStringLabel` function if available, otherwise falls back to:
 * • When `item` is an object with a `value` property, that property is used.
 * • When `item` is a primitive (e.g. `string`), it is used directly.
 */
function createCollatorItemFilter(collatorFilter, itemToStringLabel) {
  return (item, query) => {
    if (item == null) {
      return false;
    }
    const itemString = (0, _resolveValueLabel.stringifyAsLabel)(item, itemToStringLabel);
    return collatorFilter.contains(itemString, query);
  };
}

/**
 * Enhanced filter for single selection mode using Intl.Collator that shows all items
 * when query is empty or matches the current selection, making it easier to browse options.
 */
function createSingleSelectionCollatorFilter(collatorFilter, itemToStringLabel, selectedValue) {
  return (item, query) => {
    if (item == null) {
      return false;
    }
    if (!query) {
      return true;
    }
    const itemString = (0, _resolveValueLabel.stringifyAsLabel)(item, itemToStringLabel);
    const selectedString = selectedValue != null ? (0, _resolveValueLabel.stringifyAsLabel)(selectedValue, itemToStringLabel) : '';

    // Handle case-insensitive matching consistently
    if (selectedString && collatorFilter.contains(selectedString, query) && selectedString.length === query.length) {
      return true;
    }
    return collatorFilter.contains(itemString, query);
  };
}