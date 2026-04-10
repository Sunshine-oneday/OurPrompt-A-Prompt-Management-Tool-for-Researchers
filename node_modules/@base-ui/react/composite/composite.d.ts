import type { TextDirection } from "../direction-provider/DirectionContext.js";
export { stopEvent, isIndexOutOfListBounds, isListIndexDisabled, createGridCellMap, findNonDisabledListIndex, getGridCellIndexOfCorner, getGridCellIndices, getGridNavigatedIndex, getMaxListIndex, getMinListIndex } from "../floating-ui-react/utils.js";
export interface Dimensions {
  width: number;
  height: number;
}
export declare const ARROW_UP = "ArrowUp";
export declare const ARROW_DOWN = "ArrowDown";
export declare const ARROW_LEFT = "ArrowLeft";
export declare const ARROW_RIGHT = "ArrowRight";
export declare const HOME = "Home";
export declare const END = "End";
export declare const HORIZONTAL_KEYS: Set<string>;
export declare const HORIZONTAL_KEYS_WITH_EXTRA_KEYS: Set<string>;
export declare const VERTICAL_KEYS: Set<string>;
export declare const VERTICAL_KEYS_WITH_EXTRA_KEYS: Set<string>;
export declare const ARROW_KEYS: Set<string>;
export declare const ALL_KEYS: Set<string>;
export declare const COMPOSITE_KEYS: Set<string>;
export declare const SHIFT: "Shift";
export declare const CONTROL: "Control";
export declare const ALT: "Alt";
export declare const META: "Meta";
export declare const MODIFIER_KEYS: Set<"Alt" | "Control" | "Meta" | "Shift">;
export type ModifierKey = typeof MODIFIER_KEYS extends Set<infer Keys> ? Keys : never;
export declare function isNativeInput(element: EventTarget): element is HTMLElement & (HTMLInputElement | HTMLTextAreaElement);
export declare function scrollIntoViewIfNeeded(scrollContainer: HTMLElement | null, element: HTMLElement | null, direction: TextDirection, orientation: 'horizontal' | 'vertical' | 'both'): void;