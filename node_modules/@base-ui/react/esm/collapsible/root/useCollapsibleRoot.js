'use client';

import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useAnimationsFinished } from "../../utils/useAnimationsFinished.js";
import { useTransitionStatus } from "../../utils/useTransitionStatus.js";
export function useCollapsibleRoot(parameters) {
  const {
    open: openParam,
    defaultOpen,
    onOpenChange,
    disabled
  } = parameters;
  const isControlled = openParam !== undefined;
  const [open, setOpen] = useControlled({
    controlled: openParam,
    default: defaultOpen,
    name: 'Collapsible',
    state: 'open'
  });
  const {
    mounted,
    setMounted,
    transitionStatus
  } = useTransitionStatus(open, true, true);
  const [visible, setVisible] = React.useState(open);
  const [{
    height,
    width
  }, setDimensions] = React.useState({
    height: undefined,
    width: undefined
  });
  const defaultPanelId = useBaseUiId();
  const [panelIdState, setPanelIdState] = React.useState();
  const panelId = panelIdState ?? defaultPanelId;
  const [hiddenUntilFound, setHiddenUntilFound] = React.useState(false);
  const [keepMounted, setKeepMounted] = React.useState(false);
  const abortControllerRef = React.useRef(null);
  const animationTypeRef = React.useRef(null);
  const transitionDimensionRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const runOnceAnimationsFinish = useAnimationsFinished(panelRef, false);
  const handleTrigger = useStableCallback(event => {
    const nextOpen = !open;
    const eventDetails = createChangeEventDetails(REASONS.triggerPress, event.nativeEvent);
    onOpenChange(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    const panel = panelRef.current;
    if (animationTypeRef.current === 'css-animation' && panel != null) {
      panel.style.removeProperty('animation-name');
    }
    if (!hiddenUntilFound && !keepMounted) {
      if (animationTypeRef.current != null && animationTypeRef.current !== 'css-animation') {
        if (!mounted && nextOpen) {
          setMounted(true);
        }
      }
      if (animationTypeRef.current === 'css-animation') {
        if (!visible && nextOpen) {
          setVisible(true);
        }
        if (!mounted && nextOpen) {
          setMounted(true);
        }
      }
    }
    setOpen(nextOpen);
    if (animationTypeRef.current === 'none' && mounted && !nextOpen) {
      setMounted(false);
    }
  });
  useIsoLayoutEffect(() => {
    /**
     * Unmount immediately when closing in controlled mode and keepMounted={false}
     * and no CSS animations or transitions are applied
     */
    if (isControlled && animationTypeRef.current === 'none' && !keepMounted && !open) {
      setMounted(false);
    }
  }, [isControlled, keepMounted, open, openParam, setMounted]);
  return React.useMemo(() => ({
    abortControllerRef,
    animationTypeRef,
    disabled,
    handleTrigger,
    height,
    mounted,
    open,
    panelId,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setHiddenUntilFound,
    setKeepMounted,
    setMounted,
    setOpen,
    setPanelIdState,
    setVisible,
    transitionDimensionRef,
    transitionStatus,
    visible,
    width
  }), [abortControllerRef, animationTypeRef, disabled, handleTrigger, height, mounted, open, panelId, panelRef, runOnceAnimationsFinish, setDimensions, setHiddenUntilFound, setKeepMounted, setMounted, setOpen, setVisible, transitionDimensionRef, transitionStatus, visible, width]);
}