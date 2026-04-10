"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NumberFieldDecrement = void 0;
var React = _interopRequireWildcard(require("react"));
var _useRenderElement = require("../../utils/useRenderElement");
var _useButton = require("../../use-button");
var _NumberFieldRootContext = require("../root/NumberFieldRootContext");
var _useNumberFieldButton = require("../root/useNumberFieldButton");
var _stateAttributesMapping = require("../utils/stateAttributesMapping");
/**
 * A stepper button that decreases the field value when clicked.
 * Renders an `<button>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldDecrement = exports.NumberFieldDecrement = /*#__PURE__*/React.forwardRef(function NumberFieldDecrement(componentProps, forwardedRef) {
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
    minWithDefault,
    movesAfterTouchRef,
    readOnly,
    setValue,
    startAutoChange,
    state,
    stopAutoChange,
    value,
    valueRef,
    locale,
    lastChangedValueRef,
    onValueCommitted
  } = (0, _NumberFieldRootContext.useNumberFieldRootContext)();
  const isMin = value != null && value <= minWithDefault;
  const disabled = disabledProp || contextDisabled || isMin;
  const props = (0, _useNumberFieldButton.useNumberFieldButton)({
    isIncrement: false,
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
if (process.env.NODE_ENV !== "production") NumberFieldDecrement.displayName = "NumberFieldDecrement";