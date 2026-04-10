'use client';

import * as React from 'react';
import { isElement } from '@floating-ui/utils/dom';
import { useAnchorPositioning } from "../../utils/useAnchorPositioning.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { EMPTY_OBJECT, POPUP_COLLISION_AVOIDANCE } from "../../utils/constants.js";
import { getDisabledMountTransitionStyles } from "../../utils/getDisabledMountTransitionStyles.js";
import { ToastPositionerContext } from "./ToastPositionerContext.js";
import { useFloatingRootContext } from "../../floating-ui-react/index.js";
import { NOOP } from "../../utils/noop.js";
import { ToastRootCssVars } from "../root/ToastRootCssVars.js";
import { useToastProviderContext } from "../provider/ToastProviderContext.js";

/**
 * Positions the toast against the anchor.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Toast](https://base-ui.com/react/components/toast)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ToastPositioner = /*#__PURE__*/React.forwardRef(function ToastPositioner(componentProps, forwardedRef) {
  const {
    toast,
    ...props
  } = componentProps;
  const store = useToastProviderContext();
  const positionerProps = toast.positionerProps ?? EMPTY_OBJECT;
  const {
    render,
    className,
    anchor: anchorProp = positionerProps.anchor,
    positionMethod = positionerProps.positionMethod ?? 'absolute',
    side = positionerProps.side ?? 'top',
    align = positionerProps.align ?? 'center',
    sideOffset = positionerProps.sideOffset ?? 0,
    alignOffset = positionerProps.alignOffset ?? 0,
    collisionBoundary = positionerProps.collisionBoundary ?? 'clipping-ancestors',
    collisionPadding = positionerProps.collisionPadding ?? 5,
    arrowPadding = positionerProps.arrowPadding ?? 5,
    sticky = positionerProps.sticky ?? false,
    disableAnchorTracking = positionerProps.disableAnchorTracking ?? false,
    collisionAvoidance = positionerProps.collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE,
    ...elementProps
  } = props;
  const [positionerElement, setPositionerElement] = React.useState(null);
  const domIndex = store.useState('toastIndex', toast.id);
  const visibleIndex = store.useState('toastVisibleIndex', toast.id);
  const anchor = isElement(anchorProp) ? anchorProp : null;
  const floatingRootContext = useFloatingRootContext({
    open: true,
    onOpenChange: NOOP,
    elements: {
      floating: positionerElement,
      reference: anchor
    }
  });
  const positioning = useAnchorPositioning({
    anchor,
    positionMethod,
    floatingRootContext,
    mounted: true,
    side,
    sideOffset,
    align,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    sticky,
    arrowPadding,
    disableAnchorTracking,
    keepMounted: true,
    collisionAvoidance
  });
  const defaultProps = React.useMemo(() => {
    const hiddenStyles = {};
    return {
      role: 'presentation',
      style: {
        ...positioning.positionerStyles,
        ...hiddenStyles,
        [ToastRootCssVars.index]: toast.transitionStatus === 'ending' ? domIndex : visibleIndex
      }
    };
  }, [positioning.positionerStyles, toast.transitionStatus, domIndex, visibleIndex]);
  const state = React.useMemo(() => ({
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden
  }), [positioning.side, positioning.align, positioning.anchorHidden]);
  const contextValue = React.useMemo(() => ({
    ...state,
    arrowRef: positioning.arrowRef,
    arrowStyles: positioning.arrowStyles,
    arrowUncentered: positioning.arrowUncentered
  }), [state, positioning.arrowRef, positioning.arrowStyles, positioning.arrowUncentered]);
  const element = useRenderElement('div', componentProps, {
    state,
    props: [defaultProps, getDisabledMountTransitionStyles(toast.transitionStatus), elementProps],
    ref: [forwardedRef, setPositionerElement],
    stateAttributesMapping: popupStateMapping
  });
  return /*#__PURE__*/_jsx(ToastPositionerContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ToastPositioner.displayName = "ToastPositioner";