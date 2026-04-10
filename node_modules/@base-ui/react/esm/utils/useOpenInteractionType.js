'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useEnhancedClickHandler } from '@base-ui/utils/useEnhancedClickHandler';
import { isIOS } from '@base-ui/utils/detectBrowser';
import { useValueChanged } from "./useValueChanged.js";

/**
 * Determines the interaction type (keyboard, mouse, touch, etc.) that opened the component.
 *
 * @param open The open state of the component.
 */
export function useOpenInteractionType(open) {
  const [openMethod, setOpenMethod] = React.useState(null);
  const handleTriggerClick = useStableCallback((_, interactionType) => {
    if (!open) {
      setOpenMethod(interactionType || (
      // On iOS Safari, the hitslop around touch targets means tapping outside an element's
      // bounds does not fire `pointerdown` but does fire `mousedown`. The `interactionType`
      // will be "" in that case.
      isIOS ? 'touch' : ''));
    }
  });
  useValueChanged(open, previousOpen => {
    if (previousOpen && !open) {
      setOpenMethod(null);
    }
  });
  const {
    onClick,
    onPointerDown
  } = useEnhancedClickHandler(handleTriggerClick);
  return React.useMemo(() => ({
    openMethod,
    triggerProps: {
      onClick,
      onPointerDown
    }
  }), [openMethod, onClick, onPointerDown]);
}