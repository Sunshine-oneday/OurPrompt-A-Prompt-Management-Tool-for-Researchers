'use client';

import * as React from 'react';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { visuallyHidden, visuallyHiddenInput } from '@base-ui/utils/visuallyHidden';
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { EMPTY_OBJECT } from "../../utils/constants.js";
import { NOOP } from "../../utils/noop.js";
import { stateAttributesMapping } from "../utils/stateAttributesMapping.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useButton } from "../../use-button/index.js";
import { ACTIVE_COMPOSITE_ITEM } from "../../composite/constants.js";
import { CompositeItem } from "../../composite/item/CompositeItem.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { useFieldItemContext } from "../../field/item/FieldItemContext.js";
import { useLabelableContext } from "../../labelable-provider/LabelableContext.js";
import { useAriaLabelledBy } from "../../labelable-provider/useAriaLabelledBy.js";
import { useLabelableId } from "../../labelable-provider/useLabelableId.js";
import { useRadioGroupContext } from "../../radio-group/RadioGroupContext.js";
import { serializeValue } from "../../utils/serializeValue.js";
import { RadioRootContext } from "./RadioRootContext.js";

/**
 * Represents the radio button itself.
 * Renders a `<span>` element and a hidden `<input>` beside.
 *
 * Documentation: [Base UI Radio](https://base-ui.com/react/components/radio)
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const RadioRoot = /*#__PURE__*/React.forwardRef(function RadioRoot(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp = false,
    readOnly: readOnlyProp = false,
    required: requiredProp = false,
    'aria-labelledby': ariaLabelledByProp,
    value,
    inputRef: inputRefProp,
    nativeButton = false,
    id: idProp,
    ...elementProps
  } = componentProps;
  const groupContext = useRadioGroupContext();
  const {
    disabled: disabledGroup,
    readOnly: readOnlyGroup,
    required: requiredGroup,
    checkedValue,
    touched = false,
    validation,
    name
  } = groupContext ?? {};
  const setCheckedValue = groupContext?.setCheckedValue ?? NOOP;
  const setTouched = groupContext?.setTouched ?? NOOP;
  const registerControlRef = groupContext?.registerControlRef ?? NOOP;
  const registerInputRef = groupContext?.registerInputRef ?? NOOP;
  const {
    setDirty,
    validityData,
    setTouched: setFieldTouched,
    setFilled,
    state: fieldState,
    disabled: fieldDisabled
  } = useFieldRootContext();
  const fieldItemContext = useFieldItemContext();
  const {
    labelId,
    getDescriptionProps
  } = useLabelableContext();
  const disabled = fieldDisabled || fieldItemContext.disabled || disabledGroup || disabledProp;
  const readOnly = readOnlyGroup || readOnlyProp;
  const required = requiredGroup || requiredProp;
  const checked = groupContext ? checkedValue === value : value === '';
  const serializedValue = React.useMemo(() => serializeValue(value), [value]);
  const radioRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const handleControlRef = useStableCallback(element => {
    if (!element) {
      return;
    }
    registerControlRef(element, disabled);
  });
  const mergedInputRef = useMergedRefs(inputRefProp, inputRef, registerInputRef);
  useIsoLayoutEffect(() => {
    if (inputRef.current?.checked) {
      setFilled(true);
    }
  }, [setFilled]);
  useIsoLayoutEffect(() => {
    if (!inputRef.current) {
      return;
    }
    if (disabled && checked) {
      registerInputRef(null);
      return;
    }
    if (radioRef.current) {
      registerControlRef(radioRef.current, disabled);
    }
    registerInputRef(inputRef.current);
  }, [checked, disabled, registerControlRef, registerInputRef]);
  const id = useBaseUiId();
  const inputId = useLabelableId({
    id: idProp,
    implicit: false,
    controlRef: radioRef
  });
  const hiddenInputId = nativeButton ? undefined : inputId;
  const ariaLabelledBy = useAriaLabelledBy(ariaLabelledByProp, labelId, inputRef, !nativeButton, hiddenInputId);
  const rootProps = {
    role: 'radio',
    'aria-checked': checked,
    'aria-required': required || undefined,
    'aria-readonly': readOnly || undefined,
    'aria-labelledby': ariaLabelledBy,
    [ACTIVE_COMPOSITE_ITEM]: checked ? '' : undefined,
    id: nativeButton ? inputId : id,
    onKeyDown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
      }
    },
    onClick(event) {
      if (event.defaultPrevented || disabled || readOnly) {
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
    },
    onFocus(event) {
      if (event.defaultPrevented || disabled || readOnly || !touched) {
        return;
      }
      inputRef.current?.click();
      setTouched(false);
    }
  };
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  const inputProps = {
    type: 'radio',
    ref: mergedInputRef,
    id: hiddenInputId,
    name,
    tabIndex: -1,
    style: name ? visuallyHiddenInput : visuallyHidden,
    'aria-hidden': true,
    ...(value !== undefined ? {
      value: serializedValue
    } : EMPTY_OBJECT),
    disabled,
    checked,
    required,
    readOnly,
    onChange(event) {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }
      if (disabled || readOnly || value === undefined) {
        return;
      }
      const details = createChangeEventDetails(REASONS.none, event.nativeEvent);
      if (details.isCanceled) {
        return;
      }
      setFieldTouched(true);
      setDirty(value !== validityData.initialValue);
      setFilled(true);
      setCheckedValue(value, details);
    },
    onFocus() {
      radioRef.current?.focus();
    }
  };
  const state = React.useMemo(() => ({
    ...fieldState,
    required,
    disabled,
    readOnly,
    checked
  }), [fieldState, disabled, readOnly, checked, required]);
  const contextValue = state;
  const isRadioGroup = groupContext !== undefined;
  const refs = [forwardedRef, radioRef, buttonRef, handleControlRef];
  const props = [rootProps, getDescriptionProps, validation?.getValidationProps ?? EMPTY_OBJECT, elementProps, getButtonProps];
  const element = useRenderElement('span', componentProps, {
    enabled: !isRadioGroup,
    state,
    ref: refs,
    props,
    stateAttributesMapping
  });
  return /*#__PURE__*/_jsxs(RadioRootContext.Provider, {
    value: contextValue,
    children: [isRadioGroup ? /*#__PURE__*/_jsx(CompositeItem, {
      tag: "span",
      render: render,
      className: className,
      state: state,
      refs: refs,
      props: props,
      stateAttributesMapping: stateAttributesMapping
    }) : element, /*#__PURE__*/_jsx("input", {
      ...inputProps
    })]
  });
});
if (process.env.NODE_ENV !== "production") RadioRoot.displayName = "RadioRoot";