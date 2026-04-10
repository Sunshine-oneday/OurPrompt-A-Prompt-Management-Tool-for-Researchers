"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SwitchThumb = void 0;
var React = _interopRequireWildcard(require("react"));
var _SwitchRootContext = require("../root/SwitchRootContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _FieldRootContext = require("../../field/root/FieldRootContext");
var _stateAttributesMapping = require("../stateAttributesMapping");
/**
 * The movable part of the switch that indicates whether the switch is on or off.
 * Renders a `<span>`.
 *
 * Documentation: [Base UI Switch](https://base-ui.com/react/components/switch)
 */
const SwitchThumb = exports.SwitchThumb = /*#__PURE__*/React.forwardRef(function SwitchThumb(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    state: fieldState
  } = (0, _FieldRootContext.useFieldRootContext)();
  const state = (0, _SwitchRootContext.useSwitchRootContext)();
  const extendedState = {
    ...fieldState,
    ...state
  };
  return (0, _useRenderElement.useRenderElement)('span', componentProps, {
    state: extendedState,
    ref: forwardedRef,
    stateAttributesMapping: _stateAttributesMapping.stateAttributesMapping,
    props: elementProps
  });
});
if (process.env.NODE_ENV !== "production") SwitchThumb.displayName = "SwitchThumb";