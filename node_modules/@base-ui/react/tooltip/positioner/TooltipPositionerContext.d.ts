import * as React from 'react';
import type { Side, Align } from "../../utils/useAnchorPositioning.js";
export interface TooltipPositionerContext {
  open: boolean;
  side: Side;
  align: Align;
  arrowRef: React.RefObject<Element | null>;
  arrowUncentered: boolean;
  arrowStyles: React.CSSProperties;
}
export declare const TooltipPositionerContext: React.Context<TooltipPositionerContext | undefined>;
export declare function useTooltipPositionerContext(): TooltipPositionerContext;