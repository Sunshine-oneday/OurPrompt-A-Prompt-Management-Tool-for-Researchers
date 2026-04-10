'use client';

import * as React from 'react';
import { usePreviewCardRootContext } from "../root/PreviewCardContext.js";
import { PreviewCardPositionerContext } from "./PreviewCardPositionerContext.js";
import { FloatingNode, useFloatingNodeId } from "../../floating-ui-react/index.js";
import { useAnchorPositioning } from "../../utils/useAnchorPositioning.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";
import { usePreviewCardPortalContext } from "../portal/PreviewCardPortalContext.js";
import { POPUP_COLLISION_AVOIDANCE } from "../../utils/constants.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { adaptiveOrigin } from "../../utils/adaptiveOriginMiddleware.js";
import { getDisabledMountTransitionStyles } from "../../utils/getDisabledMountTransitionStyles.js";

/**
 * Positions the popup against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Preview Card](https://base-ui.com/react/components/preview-card)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const PreviewCardPositioner = /*#__PURE__*/React.forwardRef(function PreviewCardPositioner(componentProps, forwardedRef) {
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
  const store = usePreviewCardRootContext();
  const keepMounted = usePreviewCardPortalContext();
  const nodeId = useFloatingNodeId();
  const open = store.useState('open');
  const mounted = store.useState('mounted');
  const floatingRootContext = store.useState('floatingRootContext');
  const instantType = store.useState('instantType');
  const transitionStatus = store.useState('transitionStatus');
  const hasViewport = store.useState('hasViewport');
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
  const state = {
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant: instantType
  };
  const contextValue = React.useMemo(() => ({
    side: positioning.side,
    align: positioning.align,
    arrowRef: positioning.arrowRef,
    arrowUncentered: positioning.arrowUncentered,
    arrowStyles: positioning.arrowStyles
  }), [positioning.side, positioning.align, positioning.arrowRef, positioning.arrowUncentered, positioning.arrowStyles]);
  const element = useRenderElement('div', componentProps, {
    state,
    props: [defaultProps, getDisabledMountTransitionStyles(transitionStatus), elementProps],
    ref: [forwardedRef, store.useStateSetter('positionerElement')],
    stateAttributesMapping: popupStateMapping
  });
  return /*#__PURE__*/_jsx(PreviewCardPositionerContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(FloatingNode, {
      id: nodeId,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") PreviewCardPositioner.displayName = "PreviewCardPositioner";