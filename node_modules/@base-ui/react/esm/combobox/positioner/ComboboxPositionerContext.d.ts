import * as React from 'react';
import type { Side, Align } from "../../utils/useAnchorPositioning.js";
export interface ComboboxPositionerContext {
  side: Side;
  align: Align;
  arrowRef: React.RefObject<Element | null>;
  arrowUncentered: boolean;
  arrowStyles: React.CSSProperties;
  anchorHidden: boolean;
  isPositioned: boolean;
}
export declare const ComboboxPositionerContext: React.Context<ComboboxPositionerContext | undefined>;
export declare function useComboboxPositionerContext(optional?: false): ComboboxPositionerContext;
export declare function useComboboxPositionerContext(optional: true): ComboboxPositionerContext | undefined;