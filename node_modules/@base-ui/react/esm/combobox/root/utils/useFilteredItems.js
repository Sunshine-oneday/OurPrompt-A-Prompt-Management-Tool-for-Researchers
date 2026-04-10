import { useComboboxDerivedItemsContext } from "../ComboboxRootContext.js";

/**
 * Returns the internally filtered items.
 */
export function useFilteredItems() {
  const items = useComboboxDerivedItemsContext();
  return items.filteredItems;
}