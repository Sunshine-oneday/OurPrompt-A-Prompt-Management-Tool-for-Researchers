'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useButton } from "../../use-button/index.js";
import { useNumberFieldRootContext } from "../root/NumberFieldRootContext.js";
import { useNumberFieldButton } from "../root/useNumberFieldButton.js";
import { stateAttributesMapping } from "../utils/stateAttributesMapping.js";

/**
 * A stepper button that decreases the field value when clicked.
 * Renders an `<button>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
export const NumberFieldDecrement = /*#__PURE__*/React.forwardRef(function NumberFieldDecrement(componentProps, forwardedRef) {
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
  } = useNumberFieldRootContext();
  const isMin = value != null && value <= minWithDefault;
  const disabled = disabledProp || contextDisabled || isMin;
  const props = useNumberFieldButton({
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
  } = useButton({
    disabled,
    native: nativeButton,
    focusableWhenDisabled: true
  });
  const buttonState = React.useMemo(() => ({
    ...state,
    disabled
  }), [state, disabled]);
  const element = useRenderElement('button', componentProps, {
    ref: [forwardedRef, buttonRef],
    state: buttonState,
    props: [props, elementProps, getButtonProps],
    stateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") NumberFieldDecrement.displayName = "NumberFieldDecrement";