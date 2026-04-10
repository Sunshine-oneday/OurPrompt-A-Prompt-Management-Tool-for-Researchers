import * as React from 'react';
import type { Side, Align } from "../../utils/useAnchorPositioning.js";
export interface ToastPositionerContext {
  side: Side;
  align: Align;
  arrowRef: React.RefObject<Element | null>;
  arrowUncentered: boolean;
  arrowStyles: React.CSSProperties;
}
export declare const ToastPositionerContext: React.Context<ToastPositionerContext | undefined>;
export declare function useToastPositionerContext(): ToastPositionerContext;