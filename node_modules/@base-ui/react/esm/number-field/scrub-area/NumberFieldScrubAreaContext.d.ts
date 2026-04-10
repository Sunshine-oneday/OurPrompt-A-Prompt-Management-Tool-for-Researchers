import * as React from 'react';
export interface NumberFieldScrubAreaContext {
  isScrubbing: boolean;
  isTouchInput: boolean;
  isPointerLockDenied: boolean;
  scrubAreaCursorRef: React.RefObject<HTMLSpanElement | null>;
  scrubAreaRef: React.RefObject<HTMLSpanElement | null>;
  direction: 'horizontal' | 'vertical';
  pixelSensitivity: number;
  teleportDistance: number | undefined;
}
export declare const NumberFieldScrubAreaContext: React.Context<NumberFieldScrubAreaContext | undefined>;
export declare function useNumberFieldScrubAreaContext(): NumberFieldScrubAreaContext;