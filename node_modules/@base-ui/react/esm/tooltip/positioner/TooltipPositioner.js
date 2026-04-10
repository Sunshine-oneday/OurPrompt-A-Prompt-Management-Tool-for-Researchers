'use client';

import * as React from 'react';
import { useTooltipRootContext } from "../root/TooltipRootContext.js";
import { TooltipPositionerContext } from "./TooltipPositionerContext.js";
import { useAnchorPositioning } from "../../utils/useAnchorPositioning.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";
import { useTooltipPortalContext } from "../portal/TooltipPortalContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { POPUP_COLLISION_AVOIDANCE } from "../../utils/constants.js";
import { adaptiveOrigin } from "../../utils/adaptiveOriginMiddleware.js";
import { getDisabledMountTransitionStyles } from "../../utils/getDisabledMountTransitionStyles.js";

/**
 * Positions the tooltip against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const TooltipPositioner = /*#__PURE__*/React.forwardRef(function TooltipPositioner(componentProps, forwardedRef) {
  const {
    render,
    className,
    anchor,
    positionMethod = 'absolute',
    side = 'top',
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
  const store = useTooltipRootContext();
  const keepMounted = useTooltipPortalContext();
  const open = store.useState('open');
  const mounted = store.useState('mounted');
  const trackCursorAxis = store.useState('trackCursorAxis');
  const disableHoverablePopup = store.useState('disableHoverablePopup');
  const floatingRootContext = store.useState('floatingRootContext');
  const instantType = store.useState('instantType');
  const transitionStatus = store.useState('transitionStatus');
  const hasViewport = store.useState('hasViewport');
  const positioning = useAnchorPositioning({
    anchor,
    positionMethod,
    floatingRootContext,
    mounted,
    side,
    sideOffset,
    align,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    sticky,
    arrowPadding,
    disableAnchorTracking,
    keepMounted,
    collisionAvoidance,
    adaptiveOrigin: hasViewport ? adaptiveOrigin : undefined
  });
  const defaultProps = React.useMemo(() => {
    const hiddenStyles = {};
    if (!open || trackCursorAxis === 'both' || disableHoverablePopup) {
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
  }, [open, trackCursorAxis, disableHoverablePopup, mounted, positioning.positionerStyles]);
  const state = React.useMemo(() => ({
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant: trackCursorAxis !== 'none' ? 'tracking-cursor' : instantType
  }), [open, positioning.side, positioning.align, positioning.anchorHidden, trackCursorAxis, instantType]);
  const contextValue = React.useMemo(() => ({
    ...state,
    arrowRef: positioning.arrowRef,
    arrowStyles: positioning.arrowStyles,
    arrowUncentered: positioning.arrowUncentered
  }), [state, positioning.arrowRef, positioning.arrowStyles, positioning.arrowUncentered]);
  const element = useRenderElement('div', componentProps, {
    state,
    props: [defaultProps, getDisabledMountTransitionStyles(transitionStatus), elementProps],
    ref: [forwardedRef, store.useStateSetter('positionerElement')],
    stateAttributesMapping: popupStateMapping
  });
  return /*#__PURE__*/_jsx(TooltipPositionerContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") TooltipPositioner.displayName = "TooltipPositioner";