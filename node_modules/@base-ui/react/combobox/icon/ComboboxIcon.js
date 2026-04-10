"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxIcon = void 0;
var React = _interopRequireWildcard(require("react"));
var _useRenderElement = require("../../utils/useRenderElement");
/**
 * An icon that indicates that the trigger button opens the popup.
 * Renders a `<span>` element.
 */
const ComboboxIcon = exports.ComboboxIcon = /*#__PURE__*/React.forwardRef(function ComboboxIcon(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const element = (0, _useRenderElement.useRenderElement)('span', componentProps, {
    ref: forwardedRef,
    props: [{
      'aria-hidden': true,
      children: '▼'
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") ComboboxIcon.displayName = "ComboboxIcon";