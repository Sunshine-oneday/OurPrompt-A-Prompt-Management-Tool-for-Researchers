'use client';

import * as React from 'react';
import { visuallyHidden } from '@base-ui/utils/visuallyHidden';
import { MeterRootContext } from "./MeterRootContext.js";
import { formatNumberValue } from "../../utils/formatNumber.js";
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * Groups all parts of the meter and provides the value for screen readers.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Meter](https://base-ui.com/react/components/meter)
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const MeterRoot = /*#__PURE__*/React.forwardRef(function MeterRoot(componentProps, forwardedRef) {
  const {
    format,
    getAriaValueText,
    locale,
    max = 100,
    min = 0,
    value: valueProp,
    render,
    className,
    children,
    ...elementProps
  } = componentProps;
  const [labelId, setLabelId] = React.useState();
  const formattedValue = formatNumberValue(valueProp, locale, format);
  let ariaValuetext = `${valueProp}%`;
  if (getAriaValueText) {
    ariaValuetext = getAriaValueText(formattedValue, valueProp);
  } else if (format) {
    ariaValuetext = formattedValue;
  }
  const defaultProps = {
    'aria-labelledby': labelId,
    'aria-valuemax': max,
    'aria-valuemin': min,
    'aria-valuenow': valueProp,
    'aria-valuetext': ariaValuetext,
    role: 'meter',
    children: /*#__PURE__*/_jsxs(React.Fragment, {
      children: [children, /*#__PURE__*/_jsx("span", {
        role: "presentation",
        style: visuallyHidden,
        children: "x"
      })]
    })
  };
  const contextValue = React.useMemo(() => ({
    formattedValue,
    max,
    min,
    setLabelId,
    value: valueProp
  }), [formattedValue, max, min, setLabelId, valueProp]);
  const element = useRenderElement('div', componentProps, {
    ref: forwardedRef,
    props: [defaultProps, elementProps]
  });
  return /*#__PURE__*/_jsx(MeterRootContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") MeterRoot.displayName = "MeterRoot";