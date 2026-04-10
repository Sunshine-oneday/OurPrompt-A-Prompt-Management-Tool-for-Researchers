'use client';

import * as React from 'react';
import { inertValue } from '@base-ui/utils/inertValue';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { FloatingNode, useFloatingNodeId } from "../../floating-ui-react/index.js";
import { usePopoverRootContext } from "../root/PopoverRootContext.js";
import { PopoverPositionerContext } from "./PopoverPositionerContext.js";
import { useAnchorPositioning } from "../../utils/useAnchorPositioning.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";
import { usePopoverPortalContext } from "../portal/PopoverPortalContext.js";
import { InternalBackdrop } from "../../utils/InternalBackdrop.js";
import { REASONS } from "../../utils/reasons.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { POPUP_COLLISION_AVOIDANCE } from "../../utils/constants.js";
import { useAnimationsFinished } from "../../utils/useAnimationsFinished.js";
import { adaptiveOrigin } from "../../utils/adaptiveOriginMiddleware.js";
import { getDisabledMountTransitionStyles } from "../../utils/getDisabledMountTransitionStyles.js";

/**
 * Positions the popover against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const PopoverPositioner = /*#__PURE__*/React.forwardRef(function PopoverPositioner(componentProps, forwardedRef) {
  const {
    render,
    className,
    anchor,
    positionMethod = 'absolute',
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding = 5,
    arrowPadding = 5,
    sticky = false,
    disableAnchorTracking = false,
    collisionAvoidance = POPUP_COLLISION_AVOIDANCE,
    ...elementProps
  } = componentProps;
  const {
    store
  } = usePopoverRootContext();
  const keepMounted = usePopoverPortalContext();
  const nodeId = useFloatingNodeId();
  const floatingRootContext = store.useState('floatingRootContext');
  const mounted = store.useState('mounted');
  const open = store.useState('open');
  const openReason = store.useState('openChangeReason');
  const triggerElement = store.useState('activeTriggerElement');
  const modal = store.useState('modal');
  const positionerElement = store.useState('positionerElement');
  const instantType = store.useState('instantType');
  const transitionStatus = store.useState('transitionStatus');
  const hasViewport = store.useState('hasViewport');
  const prevTriggerElementRef = React.useRef(null);
  const runOnceAnimationsFinish = useAnimationsFinished(positionerElement, false, false);
  const positioning = useAnchorPositioning({
    anchor,
    floatingRootContext,
    positionMethod,
    mounted,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    collisionBoundary,
    collisionPadding,
    sticky,
    disableAnchorTracking,
    keepMounted,
    nodeId,
    collisionAvoidance,
    adaptiveOrigin: hasViewport ? adaptiveOrigin : undefined
  });
  const defaultProps = React.useMemo(() => {
    const hiddenStyles = {};
    if (!open) {
      hiddenStyles.pointerEvents = 'none';
    }
    return {
      role: 'presentation',
      hidden: !mounted,
      style: {
        ...positioning.positionerStyles,
        ...hiddenStyles
      }
    };
  }, [open, mounted, positioning.positionerStyles]);
  const positioner = React.useMemo(() => ({
    props: defaultProps,
    ...positioning
  }), [defaultProps, positioning]);
  const domReference = floatingRootContext.useState('domReferenceElement');

  // When the current trigger element changes, enable transitions on the
  // positioner temporarily
  useIsoLayoutEffect(() => {
    const currentTriggerElement = domReference;
    const prevTriggerElement = prevTriggerElementRef.current;
    if (currentTriggerElement) {
      prevTriggerElementRef.current = currentTriggerElement;
    }
    if (prevTriggerElement && currentTriggerElement && currentTriggerElement !== prevTriggerElement) {
      store.set('instantType', undefined);
      const ac = new AbortController();
      runOnceAnimationsFinish(() => {
        store.set('instantType', 'trigger-change');
      }, ac.signal);
      return () => {
        ac.abort();
      };
    }
    return undefined;
  }, [domReference, runOnceAnimationsFinish, store]);
  const state = {
    open,
    side: positioner.side,
    align: positioner.align,
    anchorHidden: positioner.anchorHidden,
    instant: instantType
  };
  const setPositionerElement = React.useCallback(element => {
    store.set('positionerElement', element);
  }, [store]);
  const element = useRenderElement('div', componentProps, {
    state,
    props: [positioner.props, getDisabledMountTransitionStyles(transitionStatus), elementProps],
    ref: [forwardedRef, setPositionerElement],
    stateAttributesMapping: popupStateMapping
  });
  return /*#__PURE__*/_jsxs(PopoverPositionerContext.Provider, {
    value: positioner,
    children: [mounted && modal === true && openReason !== REASONS.triggerHover && /*#__PURE__*/_jsx(InternalBackdrop, {
      ref: store.context.internalBackdropRef,
      inert: inertValue(!open),
      cutout: triggerElement
    }), /*#__PURE__*/_jsx(FloatingNode, {
      id: nodeId,
      children: element
    })]
  });
});
if (process.env.NODE_ENV !== "production") PopoverPositioner.displayName = "PopoverPositioner";