"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxStatus = void 0;
var React = _interopRequireWildcard(require("react"));
var _useRenderElement = require("../../utils/useRenderElement");
/**
 * Displays a status message whose content changes are announced politely to screen readers.
 * Useful for conveying the status of an asynchronously loaded list.
 * Renders a `<div>` element.
 */
const ComboboxStatus = exports.ComboboxStatus = /*#__PURE__*/React.forwardRef(function ComboboxStatus(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  return (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: forwardedRef,
    props: [{
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true
    }, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") ComboboxStatus.displayName = "ComboboxStatus";