"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NumberFieldIncrement = void 0;
var React = _interopRequireWildcard(require("react"));
var _useRenderElement = require("../../utils/useRenderElement");
var _useButton = require("../../use-button");
var _NumberFieldRootContext = require("../root/NumberFieldRootContext");
var _useNumberFieldButton = require("../root/useNumberFieldButton");
var _stateAttributesMapping = require("../utils/stateAttributesMapping");
/**
 * A stepper button that increases the field value when clicked.
 * Renders an `<button>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldIncrement = exports.NumberFieldIncrement = /*#__PURE__*/React.forwardRef(function NumberFieldIncrement(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp = false,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    allowInputSyncRef,
    disabled: contextDisabled,
    formatOptionsRef,
    getStepAmount,
    id,
    incrementValue,
    inputRef,
    inputValue,
    intentionalTouchCheckTimeout,
    isPressedRef,
    locale,
    maxWithDefault,
    movesAfterTouchRef,
    readOnly,
    setValue,
    startAutoChange,
    state,
    stopAutoChange,
    value,
    valueRef,
    lastChangedValueRef,
    onValueCommitted
  } = (0, _NumberFieldRootContext.useNumberFieldRootContext)();
  const isMax = value != null && value >= maxWithDefault;
  const disabled = disabledProp || contextDisabled || isMax;
  const props = (0, _useNumberFieldButton.useNumberFieldButton)({
    isIncrement: true,
    inputRef,
    startAutoChange,
    stopAutoChange,
    inputValue,
    disabled,
    readOnly,
    id,
    setValue,
    getStepAmount,
    incrementValue,
    allowInputSyncRef,
    formatOptionsRef,
    valueRef,
    isPressedRef,
    intentionalTouchCheckTimeout,
    movesAfterTouchRef,
    locale,
    lastChangedValueRef,
    onValueCommitted
  });
  const {
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
    disabled,
    native: nativeButton,
    focusableWhenDisabled: true
  });
  const buttonState = React.useMemo(() => ({
    ...state,
    disabled
  }), [state, disabled]);
  const element = (0, _useRenderElement.useRenderElement)('button', componentProps, {
    ref: [forwardedRef, buttonRef],
    state: buttonState,
    props: [props, elementProps, getButtonProps],
    stateAttributesMapping: _stateAttributesMapping.stateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") NumberFieldIncrement.displayName = "NumberFieldIncrement";