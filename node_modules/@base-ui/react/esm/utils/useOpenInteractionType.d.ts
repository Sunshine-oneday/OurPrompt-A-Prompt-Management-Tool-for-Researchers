import * as React from 'react';
import { InteractionType } from '@base-ui/utils/useEnhancedClickHandler';
/**
 * Determines the interaction type (keyboard, mouse, touch, etc.) that opened the component.
 *
 * @param open The open state of the component.
 */
export declare function useOpenInteractionType(open: boolean): {
  openMethod: InteractionType | null;
  triggerProps: {
    onClick: (event: React.MouseEvent | React.PointerEvent) => void;
    onPointerDown: (event: React.PointerEvent) => void;
  };
};