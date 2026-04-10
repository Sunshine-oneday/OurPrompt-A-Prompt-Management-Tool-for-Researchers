'use client';

import * as React from 'react';
import { useTooltipPositionerContext } from "../positioner/TooltipPositionerContext.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useTooltipRootContext } from "../root/TooltipRootContext.js";

/**
 * Displays an element positioned against the tooltip anchor.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
 */
export const TooltipArrow = /*#__PURE__*/React.forwardRef(function TooltipArrow(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const store = useTooltipRootContext();
  const instantType = store.useState('instantType');
  const {
    open,
    arrowRef,
    side,
    align,
    arrowUncentered,
    arrowStyles
  } = useTooltipPositionerContext();
  const state = {
    open,
    side,
    align,
    uncentered: arrowUncentered,
    instant: instantType
  };
  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, arrowRef],
    props: [{
      style: arrowStyles,
      'aria-hidden': true
    }, elementProps],
    stateAttributesMapping: popupStateMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") TooltipArrow.displayName = "TooltipArrow";