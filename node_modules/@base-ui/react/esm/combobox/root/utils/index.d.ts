import type { Filter } from "./useFilter.js";
/**
 * Enhanced filter using Intl.Collator for more robust string matching.
 * Uses the provided `itemToStringLabel` function if available, otherwise falls back to:
 * • When `item` is an object with a `value` property, that property is used.
 * • When `item` is a primitive (e.g. `string`), it is used directly.
 */
export declare function createCollatorItemFilter(collatorFilter: Filter, itemToStringLabel?: (item: any) => string): (item: any, query: string) => boolean;
/**
 * Enhanced filter for single selection mode using Intl.Collator that shows all items
 * when query is empty or matches the current selection, making it easier to browse options.
 */
export declare function createSingleSelectionCollatorFilter(collatorFilter: Filter, itemToStringLabel?: (item: any) => string, selectedValue?: any): (item: any, query: string) => boolean;