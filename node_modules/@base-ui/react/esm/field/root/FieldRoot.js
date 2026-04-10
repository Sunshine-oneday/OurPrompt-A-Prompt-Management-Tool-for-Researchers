'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { FieldRootContext } from "./FieldRootContext.js";
import { DEFAULT_VALIDITY_STATE, fieldValidityMapping } from "../utils/constants.js";
import { useFieldsetRootContext } from "../../fieldset/root/FieldsetRootContext.js";
import { useFormContext } from "../../form/FormContext.js";
import { LabelableProvider } from "../../labelable-provider/index.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useFieldValidation } from "./useFieldValidation.js";

/**
 * @internal
 */
import { jsx as _jsx } from "react/jsx-runtime";
const FieldRootInner = /*#__PURE__*/React.forwardRef(function FieldRootInner(componentProps, forwardedRef) {
  const {
    errors,
    validationMode: formValidationMode,
    submitAttemptedRef
  } = useFormContext();
  const {
    render,
    className,
    validate: validateProp,
    validationDebounceTime = 0,
    validationMode = formValidationMode,
    name,
    disabled: disabledProp = false,
    invalid: invalidProp,
    dirty: dirtyProp,
    touched: touchedProp,
    actionsRef,
    ...elementProps
  } = componentProps;
  const {
    disabled: disabledFieldset
  } = useFieldsetRootContext();
  const validate = useStableCallback(validateProp || (() => null));
  const disabled = disabledFieldset || disabledProp;
  const [touchedState, setTouchedUnwrapped] = React.useState(false);
  const [dirtyState, setDirtyUnwrapped] = React.useState(false);
  const [filled, setFilled] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const dirty = dirtyProp ?? dirtyState;
  const touched = touchedProp ?? touchedState;
  const markedDirtyRef = React.useRef(false);
  const setDirty = useStableCallback(value => {
    if (dirtyProp !== undefined) {
      return;
    }
    if (value) {
      markedDirtyRef.current = true;
    }
    setDirtyUnwrapped(value);
  });
  const setTouched = useStableCallback(value => {
    if (touchedProp !== undefined) {
      return;
    }
    setTouchedUnwrapped(value);
  });
  const shouldValidateOnChange = useStableCallback(() => validationMode === 'onChange' || validationMode === 'onSubmit' && submitAttemptedRef.current);
  const hasFormError = !!name && Object.hasOwn(errors, name) && errors[name] !== undefined;
  const invalid = invalidProp === true || hasFormError;
  const [validityData, setValidityData] = React.useState({
    state: DEFAULT_VALIDITY_STATE,
    error: '',
    errors: [],
    value: null,
    initialValue: null
  });
  const valid = !invalid && validityData.state.valid;
  const state = React.useMemo(() => ({
    disabled,
    touched,
    dirty,
    valid,
    filled,
    focused
  }), [disabled, touched, dirty, valid, filled, focused]);
  const validation = useFieldValidation({
    setValidityData,
    validate,
    validityData,
    validationDebounceTime,
    invalid,
    markedDirtyRef,
    state,
    name,
    shouldValidateOnChange
  });
  const handleImperativeValidate = React.useCallback(() => {
    markedDirtyRef.current = true;
    validation.commit(validityData.value);
  }, [validation, validityData]);
  React.useImperativeHandle(actionsRef, () => ({
    validate: handleImperativeValidate
  }), [handleImperativeValidate]);
  const contextValue = React.useMemo(() => ({
    invalid,
    name,
    validityData,
    setValidityData,
    disabled,
    touched,
    setTouched,
    dirty,
    setDirty,
    filled,
    setFilled,
    focused,
    setFocused,
    validate,
    validationMode,
    validationDebounceTime,
    shouldValidateOnChange,
    state,
    markedDirtyRef,
    validation
  }), [invalid, name, validityData, disabled, touched, setTouched, dirty, setDirty, filled, setFilled, focused, setFocused, validate, validationMode, validationDebounceTime, shouldValidateOnChange, state, validation]);
  const element = useRenderElement('div', componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping: fieldValidityMapping
  });
  return /*#__PURE__*/_jsx(FieldRootContext.Provider, {
    value: contextValue,
    children: element
  });
});

/**
 * Groups all parts of the field.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Field](https://base-ui.com/react/components/field)
 */
if (process.env.NODE_ENV !== "production") FieldRootInner.displayName = "FieldRootInner";
export const FieldRoot = /*#__PURE__*/React.forwardRef(function FieldRoot(componentProps, forwardedRef) {
  return /*#__PURE__*/_jsx(LabelableProvider, {
    children: /*#__PURE__*/_jsx(FieldRootInner, {
      ...componentProps,
      ref: forwardedRef
    })
  });
});
if (process.env.NODE_ENV !== "production") FieldRoot.displayName = "FieldRoot";