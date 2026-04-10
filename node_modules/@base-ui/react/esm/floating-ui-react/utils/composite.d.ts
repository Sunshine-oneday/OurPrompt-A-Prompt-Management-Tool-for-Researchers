import type { Dimensions } from "../types.js";
type DisabledIndices = ReadonlyArray<number> | ((index: number) => boolean);
export declare function isDifferentGridRow(index: number, cols: number, prevRow: number): boolean;
export declare function isIndexOutOfListBounds(listRef: React.RefObject<Array<HTMLElement | null>>, index: number): boolean;
export declare function getMinListIndex(listRef: React.RefObject<ReadonlyArray<HTMLElement | null>>, disabledIndices?: DisabledIndices | undefined): number;
export declare function getMaxListIndex(listRef: React.RefObject<Array<HTMLElement | null>>, disabledIndices?: DisabledIndices | undefined): number;
export declare function findNonDisabledListIndex(listRef: React.RefObject<ReadonlyArray<HTMLElement | null>>, {
  startingIndex,
  decrement,
  disabledIndices,
  amount
}?: {
  startingIndex?: number | undefined;
  decrement?: boolean | undefined;
  disabledIndices?: DisabledIndices | undefined;
  amount?: number | undefined;
}): number;
export declare function getGridNavigatedIndex(listRef: React.RefObject<Array<HTMLElement | null>>, {
  event,
  orientation,
  loopFocus,
  rtl,
  cols,
  disabledIndices,
  minIndex,
  maxIndex,
  prevIndex,
  stopEvent: stop
}: {
  event: React.KeyboardEvent;
  orientation: 'horizontal' | 'vertical' | 'both';
  loopFocus: boolean;
  rtl: boolean;
  cols: number;
  disabledIndices: DisabledIndices | undefined;
  minIndex: number;
  maxIndex: number;
  prevIndex: number;
  stopEvent?: boolean | undefined;
}): number;
/** For each cell index, gets the item index that occupies that cell */
export declare function createGridCellMap(sizes: Dimensions[], cols: number, dense: boolean): (number | undefined)[];
/** Gets cell index of an item's corner or -1 when index is -1. */
export declare function getGridCellIndexOfCorner(index: number, sizes: Dimensions[], cellMap: (number | undefined)[], cols: number, corner: 'tl' | 'tr' | 'bl' | 'br'): number;
/** Gets all cell indices that correspond to the specified indices */
export declare function getGridCellIndices(indices: (number | undefined)[], cellMap: (number | undefined)[]): number[];
export declare function isListIndexDisabled(listRef: React.RefObject<ReadonlyArray<HTMLElement | null>>, index: number, disabledIndices?: DisabledIndices): boolean;
export declare function isElementVisible(element: Element): boolean;
export {};