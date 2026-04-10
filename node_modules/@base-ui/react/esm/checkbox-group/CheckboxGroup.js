'use client';

import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useBaseUiId } from "../utils/useBaseUiId.js";
import { useRenderElement } from "../utils/useRenderElement.js";
import { CheckboxGroupContext } from "./CheckboxGroupContext.js";
import { useFieldRootContext } from "../field/root/FieldRootContext.js";
import { useLabelableContext } from "../labelable-provider/LabelableContext.js";
import { fieldValidityMapping } from "../field/utils/constants.js";
import { useField } from "../field/useField.js";
import { PARENT_CHECKBOX } from "../checkbox/root/CheckboxRoot.js";
import { useCheckboxGroupParent } from "./useCheckboxGroupParent.js";
import { useFormContext } from "../form/FormContext.js";
import { useValueChanged } from "../utils/useValueChanged.js";
import { areArraysEqual } from "../utils/areArraysEqual.js";
import { EMPTY_ARRAY } from "../utils/constants.js";

/**
 * Provides a shared state to a series of checkboxes.
 *
 * Documentation: [Base UI Checkbox Group](https://base-ui.com/react/components/checkbox-group)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const CheckboxGroup = /*#__PURE__*/React.forwardRef(function CheckboxGroup(componentProps, forwardedRef) {
  const {
    allValues,
    className,
    defaultValue,
    disabled: disabledProp = false,
    id: idProp,
    onValueChange,
    render,
    value: externalValue,
    ...elementProps
  } = componentProps;
  const {
    disabled: fieldDisabled,
    name: fieldName,
    state: fieldState,
    validation,
    setFilled,
    setDirty,
    shouldValidateOnChange,
    validityData
  } = useFieldRootContext();
  const {
    labelId,
    getDescriptionProps
  } = useLabelableContext();
  const {
    clearErrors
  } = useFormContext();
  const disabled = fieldDisabled || disabledProp;
  const [value, setValueUnwrapped] = useControlled({
    controlled: externalValue,
    default: defaultValue,
    name: 'CheckboxGroup',
    state: 'value'
  });
  const setValue = useStableCallback((v, eventDetails) => {
    onValueChange?.(v, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setValueUnwrapped(v);
  });
  const parent = useCheckboxGroupParent({
    allValues,
    value: externalValue,
    onValueChange
  });
  const id = useBaseUiId(idProp);
  const controlRef = React.useRef(null);
  const registerControlRef = React.useCallback(element => {
    if (controlRef.current == null && element != null && !element.hasAttribute(PARENT_CHECKBOX)) {
      controlRef.current = element;
    }
  }, []);
  useField({
    enabled: !!fieldName,
    id,
    commit: validation.commit,
    value,
    controlRef,
    name: fieldName,
    getValue: () => value
  });
  const resolvedValue = value ?? EMPTY_ARRAY;
  useValueChanged(resolvedValue, () => {
    if (fieldName) {
      clearErrors(fieldName);
    }
    const initialValue = Array.isArray(validityData.initialValue) ? validityData.initialValue : EMPTY_ARRAY;
    setFilled(resolvedValue.length > 0);
    setDirty(!areArraysEqual(resolvedValue, initialValue));
    if (shouldValidateOnChange()) {
      validation.commit(resolvedValue);
    } else {
      validation.commit(resolvedValue, true);
    }
  });
  const state = {
    ...fieldState,
    disabled
  };
  const contextValue = React.useMemo(() => ({
    allValues,
    value,
    defaultValue,
    setValue,
    parent,
    disabled,
    validation,
    registerControlRef
  }), [allValues, value, defaultValue, setValue, parent, disabled, validation, registerControlRef]);
  const element = useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      role: 'group',
      'aria-labelledby': labelId
    }, getDescriptionProps, elementProps],
    stateAttributesMapping: fieldValidityMapping
  });
  return /*#__PURE__*/_jsx(CheckboxGroupContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") CheckboxGroup.displayName = "CheckboxGroup";