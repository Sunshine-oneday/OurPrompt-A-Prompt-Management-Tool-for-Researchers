'use client';

import * as React from 'react';
import { usePopoverRootContext } from "../root/PopoverRootContext.js";
import { usePopoverPositionerContext } from "../positioner/PopoverPositionerContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { PopoverViewportCssVars } from "./PopoverViewportCssVars.js";
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
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
export const PopoverViewport = /*#__PURE__*/React.forwardRef(function PopoverViewport(componentProps, forwardedRef) {
  const {
    render,
    className,
    children,
    ...elementProps
  } = componentProps;
  const {
    store
  } = usePopoverRootContext();
  const {
    side
  } = usePopoverPositionerContext();
  const instantType = store.useState('instantType');
  const {
    children: childrenToRender,
    state: viewportState
  } = usePopupViewport({
    store,
    side,
    cssVars: PopoverViewportCssVars,
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
if (process.env.NODE_ENV !== "production") PopoverViewport.displayName = "PopoverViewport";