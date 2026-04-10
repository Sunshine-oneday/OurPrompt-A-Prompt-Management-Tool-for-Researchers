import * as React from 'react';
import type { Side, Align } from "../../utils/useAnchorPositioning.js";
export interface PreviewCardPositionerContext {
  side: Side;
  align: Align;
  arrowRef: React.RefObject<Element | null>;
  arrowUncentered: boolean;
  arrowStyles: React.CSSProperties;
}
export declare const PreviewCardPositionerContext: React.Context<PreviewCardPositionerContext | undefined>;
export declare function usePreviewCardPositionerContext(): PreviewCardPositionerContext;