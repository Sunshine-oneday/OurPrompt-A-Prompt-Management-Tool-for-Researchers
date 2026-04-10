'use client';

import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { visuallyHidden, visuallyHiddenInput } from '@base-ui/utils/visuallyHidden';
import { EMPTY_OBJECT } from '@base-ui/utils/empty';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { mergeProps } from "../../merge-props/index.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useButton } from "../../use-button/index.js";
import { SwitchRootContext } from "./SwitchRootContext.js";
import { stateAttributesMapping } from "../stateAttributesMapping.js";
import { useField } from "../../field/useField.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { useFormContext } from "../../form/FormContext.js";
import { useLabelableContext } from "../../labelable-provider/LabelableContext.js";
import { useAriaLabelledBy } from "../../labelable-provider/useAriaLabelledBy.js";
import { useLabelableId } from "../../labelable-provider/useLabelableId.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useValueChanged } from "../../utils/useValueChanged.js";

/**
 * Represents the switch itself.
 * Renders a `<span>` element and a hidden `<input>` beside.
 *
 * Documentation: [Base UI Switch](https://base-ui.com/react/components/switch)
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const SwitchRoot = /*#__PURE__*/React.forwardRef(function SwitchRoot(componentProps, forwardedRef) {
  const {
    checked: checkedProp,
    className,
    defaultChecked,
    'aria-labelledby': ariaLabelledByProp,
    id: idProp,
    inputRef: externalInputRef,
    name: nameProp,
    nativeButton = false,
    onCheckedChange: onCheckedChangeProp,
    readOnly = false,
    required = false,
    disabled: disabledProp = false,
    render,
    uncheckedValue,
    value,
    ...elementProps
  } = componentProps;
  const {
    clearErrors
  } = useFormContext();
  const {
    state: fieldState,
    setTouched,
    setDirty,
    validityData,
    setFilled,
    setFocused,
    shouldValidateOnChange,
    validationMode,
    disabled: fieldDisabled,
    name: fieldName,
    validation
  } = useFieldRootContext();
  const {
    labelId
  } = useLabelableContext();
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const onCheckedChange = useStableCallback(onCheckedChangeProp);
  const inputRef = React.useRef(null);
  const handleInputRef = useMergedRefs(inputRef, externalInputRef, validation.inputRef);
  const switchRef = React.useRef(null);
  const id = useBaseUiId();
  const controlId = useLabelableId({
    id: idProp,
    implicit: false,
    controlRef: switchRef
  });
  const hiddenInputId = nativeButton ? undefined : controlId;
  const [checked, setCheckedState] = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: 'Switch',
    state: 'checked'
  });
  useField({
    id,
    commit: validation.commit,
    value: checked,
    controlRef: switchRef,
    name,
    getValue: () => checked
  });
  useIsoLayoutEffect(() => {
    if (inputRef.current) {
      setFilled(inputRef.current.checked);
    }
  }, [inputRef, setFilled]);
  useValueChanged(checked, () => {
    clearErrors(name);
    setDirty(checked !== validityData.initialValue);
    setFilled(checked);
    if (shouldValidateOnChange()) {
      validation.commit(checked);
    } else {
      validation.commit(checked, true);
    }
  });
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  const ariaLabelledBy = useAriaLabelledBy(ariaLabelledByProp, labelId, inputRef, !nativeButton, hiddenInputId);
  const rootProps = {
    id: nativeButton ? controlId : id,
    role: 'switch',
    'aria-checked': checked,
    'aria-readonly': readOnly || undefined,
    'aria-required': required || undefined,
    'aria-labelledby': ariaLabelledBy,
    onFocus() {
      if (!disabled) {
        setFocused(true);
      }
    },
    onBlur() {
      const element = inputRef.current;
      if (!element || disabled) {
        return;
      }
      setTouched(true);
      setFocused(false);
      if (validationMode === 'onBlur') {
        validation.commit(element.checked);
      }
    },
    onClick(event) {
      if (readOnly || disabled) {
        return;
      }
      event.preventDefault();
      inputRef.current?.dispatchEvent(new PointerEvent('click', {
        bubbles: true,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        metaKey: event.metaKey
      }));
    }
  };
  const inputProps = React.useMemo(() => mergeProps({
    checked,
    disabled,
    id: hiddenInputId,
    name,
    required,
    style: name ? visuallyHiddenInput : visuallyHidden,
    tabIndex: -1,
    type: 'checkbox',
    'aria-hidden': true,
    ref: handleInputRef,
    onChange(event) {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }
      const nextChecked = event.target.checked;
      const eventDetails = createChangeEventDetails(REASONS.none, event.nativeEvent);
      onCheckedChange?.(nextChecked, eventDetails);
      if (eventDetails.isCanceled) {
        return;
      }
      setCheckedState(nextChecked);
    },
    onFocus() {
      switchRef.current?.focus();
    }
  }, validation.getInputValidationProps,
  // React <19 sets an empty value if `undefined` is passed explicitly
  // To avoid this, we only set the value if it's defined
  value !== undefined ? {
    value
  } : EMPTY_OBJECT), [checked, disabled, handleInputRef, hiddenInputId, name, onCheckedChange, required, setCheckedState, validation, value]);
  const state = React.useMemo(() => ({
    ...fieldState,
    checked,
    disabled,
    readOnly,
    required
  }), [fieldState, checked, disabled, readOnly, required]);
  const element = useRenderElement('span', componentProps, {
    state,
    ref: [forwardedRef, switchRef, buttonRef],
    props: [rootProps, validation.getValidationProps, elementProps, getButtonProps],
    stateAttributesMapping
  });
  return /*#__PURE__*/_jsxs(SwitchRootContext.Provider, {
    value: state,
    children: [element, !checked && name && uncheckedValue !== undefined && /*#__PURE__*/_jsx("input", {
      type: "hidden",
      name: name,
      value: uncheckedValue
    }), /*#__PURE__*/_jsx("input", {
      ...inputProps
    })]
  });
});
if (process.env.NODE_ENV !== "production") SwitchRoot.displayName = "SwitchRoot";