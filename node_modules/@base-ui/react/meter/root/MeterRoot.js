"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MeterRoot = void 0;
var React = _interopRequireWildcard(require("react"));
var _visuallyHidden = require("@base-ui/utils/visuallyHidden");
var _MeterRootContext = require("./MeterRootContext");
var _formatNumber = require("../../utils/formatNumber");
var _useRenderElement = require("../../utils/useRenderElement");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups all parts of the meter and provides the value for screen readers.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Meter](https://base-ui.com/react/components/meter)
 */
const MeterRoot = exports.MeterRoot = /*#__PURE__*/React.forwardRef(function MeterRoot(componentProps, forwardedRef) {
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
  const formattedValue = (0, _formatNumber.formatNumberValue)(valueProp, locale, format);
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
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
      children: [children, /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        role: "presentation",
        style: _visuallyHidden.visuallyHidden,
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
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: forwardedRef,
    props: [defaultProps, elementProps]
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_MeterRootContext.MeterRootContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") MeterRoot.displayName = "MeterRoot";