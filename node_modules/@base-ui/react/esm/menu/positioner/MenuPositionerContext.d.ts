import * as React from 'react';
import type { Side, Align } from "../../utils/useAnchorPositioning.js";
export interface MenuPositionerContext {
  /**
   * The side of the anchor element the popup is positioned relative to.
   */
  side: Side;
  /**
   * How to align the popup relative to the specified side.
   */
  align: Align;
  arrowRef: React.RefObject<Element | null>;
  arrowUncentered: boolean;
  arrowStyles: React.CSSProperties;
  nodeId: string | undefined;
}
export declare const MenuPositionerContext: React.Context<MenuPositionerContext | undefined>;
export declare function useMenuPositionerContext(optional?: false): MenuPositionerContext;
export declare function useMenuPositionerContext(optional: true): MenuPositionerContext | undefined;