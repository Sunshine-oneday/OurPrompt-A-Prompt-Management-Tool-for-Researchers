'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { valueToPercent } from "../../utils/valueToPercent.js";
import { useProgressRootContext } from "../root/ProgressRootContext.js";
import { progressStateAttributesMapping } from "../root/stateAttributesMapping.js";
/**
 * Visualizes the completion status of the task.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Progress](https://base-ui.com/react/components/progress)
 */
export const ProgressIndicator = /*#__PURE__*/React.forwardRef(function ProgressIndicator(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    max,
    min,
    value,
    state
  } = useProgressRootContext();
  const percentageValue = Number.isFinite(value) && value !== null ? valueToPercent(value, min, max) : null;
  const getStyles = React.useCallback(() => {
    if (percentageValue == null) {
      return {};
    }
    return {
      insetInlineStart: 0,
      height: 'inherit',
      width: `${percentageValue}%`
    };
  }, [percentageValue]);
  const element = useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      style: getStyles()
    }, elementProps],
    stateAttributesMapping: progressStateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") ProgressIndicator.displayName = "ProgressIndicator";