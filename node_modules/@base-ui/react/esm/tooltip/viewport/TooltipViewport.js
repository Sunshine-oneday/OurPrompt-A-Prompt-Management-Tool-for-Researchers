'use client';

import * as React from 'react';
import { useTooltipRootContext } from "../root/TooltipRootContext.js";
import { useTooltipPositionerContext } from "../positioner/TooltipPositionerContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { TooltipViewportCssVars } from "./TooltipViewportCssVars.js";
import { usePopupViewport } from "../../utils/usePopupViewport.js";
const stateAttributesMapping = {
  activationDirection: value => value ? {
    'data-activation-direction': value
  } : null
};

/**
 * A viewport for displaying content transitions.
 * This component is only required if one popup can be opened by multiple triggers, its content change based on the trigger
 * and switching between them is animated.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
 */
export const TooltipViewport = /*#__PURE__*/React.forwardRef(function TooltipViewport(componentProps, forwardedRef) {
  const {
    render,
    className,
    children,
    ...elementProps
  } = componentProps;
  const store = useTooltipRootContext();
  const positioner = useTooltipPositionerContext();
  const instantType = store.useState('instantType');
  const {
    children: childrenToRender,
    state: viewportState
  } = usePopupViewport({
    store,
    side: positioner.side,
    cssVars: TooltipViewportCssVars,
    children
  });
  const state = {
    activationDirection: viewportState.activationDirection,
    transitioning: viewportState.transitioning,
    instant: instantType
  };
  return useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [elementProps, {
      children: childrenToRender
    }],
    stateAttributesMapping
  });
});
if (process.env.NODE_ENV !== "production") TooltipViewport.displayName = "TooltipViewport";