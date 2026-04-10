export interface UseFilterOptions extends Intl.CollatorOptions {
  /**
   * The locale to use for string comparison.
   * Defaults to the user's runtime locale.
   */
  locale?: Intl.LocalesArgument | undefined;
}
export interface Filter {
  contains: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
  startsWith: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
  endsWith: <Item>(item: Item, query: string, itemToString?: (item: Item) => string) => boolean;
}
declare function getFilter(options?: UseFilterOptions): Filter;
/**
 * Matches items against a query using `Intl.Collator` for robust string matching.
 */
export declare const useCoreFilter: typeof getFilter;
export interface UseComboboxFilterOptions extends UseFilterOptions {
  /**
   * Whether the combobox is in multiple selection mode.
   * @default false
   */
  multiple?: boolean | undefined;
  /**
   * The current value of the combobox.
   */
  value?: any;
}
/**
 * Matches items against a query using `Intl.Collator` for robust string matching.
 */
export declare function useComboboxFilter(options?: UseComboboxFilterOptions): Filter;
export {};