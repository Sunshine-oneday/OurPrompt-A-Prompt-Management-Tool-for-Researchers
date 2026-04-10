'use client';

import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useBaseUiId } from "../utils/useBaseUiId.js";
import { contains } from "../floating-ui-react/utils.js";
import { SHIFT } from "../composite/composite.js";
import { CompositeRoot } from "../composite/root/CompositeRoot.js";
import { useField } from "../field/useField.js";
import { useFieldRootContext } from "../field/root/FieldRootContext.js";
import { fieldValidityMapping } from "../field/utils/constants.js";
import { useFieldsetRootContext } from "../fieldset/root/FieldsetRootContext.js";
import { useFormContext } from "../form/FormContext.js";
import { useLabelableContext } from "../labelable-provider/LabelableContext.js";
import { useValueChanged } from "../utils/useValueChanged.js";
import { RadioGroupContext } from "./RadioGroupContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
const MODIFIER_KEYS = [SHIFT];

/**
 * Provides a shared state to a series of radio buttons.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Radio Group](https://base-ui.com/react/components/radio)
 */
export const RadioGroup = /*#__PURE__*/React.forwardRef(function RadioGroup(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp,
    readOnly,
    required,
    onValueChange: onValueChangeProp,
    value: externalValue,
    defaultValue,
    name: nameProp,
    inputRef: inputRefProp,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    setTouched: setFieldTouched,
    setFocused,
    shouldValidateOnChange,
    validationMode,
    name: fieldName,
    disabled: fieldDisabled,
    state: fieldState,
    validation,
    setDirty,
    setFilled,
    validityData
  } = useFieldRootContext();
  const {
    labelId
  } = useLabelableContext();
  const {
    clearErrors
  } = useFormContext();
  const fieldsetContext = useFieldsetRootContext(true);
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const id = useBaseUiId(idProp);
  const [checkedValue, setCheckedValueUnwrapped] = useControlled({
    controlled: externalValue,
    default: defaultValue,
    name: 'RadioGroup',
    state: 'value'
  });
  const onValueChange = useStableCallback(onValueChangeProp);
  const setCheckedValue = useStableCallback((value, eventDetails) => {
    onValueChange(value, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setCheckedValueUnwrapped(value);
  });
  const controlRef = React.useRef(null);
  const groupInputRef = React.useRef(null);
  const firstEnabledInputRef = React.useRef(null);
  function setInputRef(hiddenInput) {
    let cleanup = undefined;
    if (inputRefProp) {
      if (typeof inputRefProp === 'function') {
        cleanup = inputRefProp(hiddenInput);
      } else {
        inputRefProp.current = hiddenInput;
      }
    }
    groupInputRef.current = hiddenInput;
    validation.inputRef.current = hiddenInput;
    return cleanup;
  }
  const registerControlRef = useStableCallback((element, isDisabled = false) => {
    if (!element) {
      return;
    }
    if (isDisabled) {
      if (controlRef.current === element) {
        controlRef.current = null;
      }
      return;
    }
    if (controlRef.current == null) {
      controlRef.current = element;
    }
  });
  const registerInputRef = useStableCallback(input => {
    if (!input || input.disabled) {
      return undefined;
    }
    if (!firstEnabledInputRef.current) {
      firstEnabledInputRef.current = input;
    }
    const currentInput = groupInputRef.current;
    if (input.checked || currentInput == null || currentInput.disabled) {
      return setInputRef(input);
    }
    return undefined;
  });
  useField({
    id,
    commit: validation.commit,
    value: checkedValue,
    controlRef,
    name,
    getValue: () => checkedValue ?? null
  });
  useValueChanged(checkedValue, () => {
    clearErrors(name);
    setDirty(checkedValue !== validityData.initialValue);
    setFilled(checkedValue != null);
    if (shouldValidateOnChange()) {
      validation.commit(checkedValue);
    } else {
      validation.commit(checkedValue, true);
    }
    const fallbackInput = firstEnabledInputRef.current;
    if (checkedValue == null && fallbackInput && !fallbackInput.disabled) {
      setInputRef(fallbackInput);
    }
  });
  const [touched, setTouched] = React.useState(false);
  const ariaLabelledby = elementProps['aria-labelledby'] ?? labelId ?? fieldsetContext?.legendId;
  const state = {
    ...fieldState,
    disabled: disabled ?? false,
    required: required ?? false,
    readOnly: readOnly ?? false
  };
  const contextValue = React.useMemo(() => ({
    ...fieldState,
    checkedValue,
    disabled,
    validation,
    name,
    onValueChange,
    readOnly,
    registerControlRef,
    registerInputRef,
    required,
    setCheckedValue,
    setTouched,
    touched
  }), [checkedValue, disabled, validation, fieldState, name, onValueChange, readOnly, registerControlRef, registerInputRef, required, setCheckedValue, setTouched, touched]);
  const defaultProps = {
    role: 'radiogroup',
    'aria-required': required || undefined,
    'aria-disabled': disabled || undefined,
    'aria-readonly': readOnly || undefined,
    'aria-labelledby': ariaLabelledby,
    onFocus() {
      setFocused(true);
    },
    onBlur(event) {
      if (!contains(event.currentTarget, event.relatedTarget)) {
        setFieldTouched(true);
        setFocused(false);
        if (validationMode === 'onBlur') {
          validation.commit(checkedValue);
        }
      }
    },
    onKeyDownCapture(event) {
      if (event.key.startsWith('Arrow')) {
        setFieldTouched(true);
        setTouched(true);
        setFocused(true);
      }
    }
  };
  return /*#__PURE__*/_jsx(RadioGroupContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(CompositeRoot, {
      render: render,
      className: className,
      state: state,
      props: [defaultProps, validation.getValidationProps, elementProps],
      refs: [forwardedRef],
      stateAttributesMapping: fieldValidityMapping,
      enableHomeAndEndKeys: false,
      modifierKeys: MODIFIER_KEYS
    })
  });
});
if (process.env.NODE_ENV !== "production") RadioGroup.displayName = "RadioGroup";