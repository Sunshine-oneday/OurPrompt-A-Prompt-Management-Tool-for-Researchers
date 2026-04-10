'use client';

import * as React from 'react';
import { valueToPercent } from "../../utils/valueToPercent.js";
import { useMeterRootContext } from "../root/MeterRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * Visualizes the position of the value along the range.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Meter](https://base-ui.com/react/components/meter)
 */
export const MeterIndicator = /*#__PURE__*/React.forwardRef(function MeterIndicator(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const context = useMeterRootContext();
  const percentageWidth = valueToPercent(context.value, context.min, context.max);
  return useRenderElement('div', componentProps, {
    ref: forwardedRef,
    props: [{
      style: {
        insetInlineStart: 0,
        height: 'inherit',
        width: `${percentageWidth}%`
      }
    }, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") MeterIndicator.displayName = "MeterIndicator";