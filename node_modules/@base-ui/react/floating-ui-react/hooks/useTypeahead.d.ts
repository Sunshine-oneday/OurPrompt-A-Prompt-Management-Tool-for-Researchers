import * as React from 'react';
import type { ElementProps, FloatingContext, FloatingRootContext } from "../types.js";
export interface UseTypeaheadProps {
  /**
   * A ref which contains an array of strings whose indices match the HTML
   * elements of the list.
   * @default empty list
   */
  listRef: React.RefObject<Array<string | null>>;
  /**
   * The index of the active (focused or highlighted) item in the list.
   * @default null
   */
  activeIndex: number | null;
  /**
   * Callback invoked with the matching index if found as the user types.
   */
  onMatch?: ((index: number) => void) | undefined;
  /**
   * Optional list of item elements that correspond to `listRef` indices.
   * When an element exists for an index, typeahead skips it if it is hidden
   * via CSS (`display: none`).
   */
  elementsRef?: React.RefObject<Array<HTMLElement | null>> | undefined;
  /**
   * Callback invoked with the typing state as the user types.
   */
  onTypingChange?: ((isTyping: boolean) => void) | undefined;
  /**
   * Whether the Hook is enabled, including all internal Effects and event
   * handlers.
   * @default true
   */
  enabled?: boolean | undefined;
  /**
   * The number of milliseconds to wait before resetting the typed string.
   * @default 750
   */
  resetMs?: number | undefined;
  /**
   * The index of the selected item in the list, if available.
   * @default null
   */
  selectedIndex?: number | null | undefined;
}
/**
 * Provides a matching callback that can be used to focus an item as the user
 * types, often used in tandem with `useListNavigation()`.
 * @see https://floating-ui.com/docs/useTypeahead
 */
export declare function useTypeahead(context: FloatingRootContext | FloatingContext, props: UseTypeaheadProps): ElementProps;