"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RadioGroup = void 0;
var React = _interopRequireWildcard(require("react"));
var _useControlled = require("@base-ui/utils/useControlled");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useBaseUiId = require("../utils/useBaseUiId");
var _utils = require("../floating-ui-react/utils");
var _composite = require("../composite/composite");
var _CompositeRoot = require("../composite/root/CompositeRoot");
var _useField = require("../field/useField");
var _FieldRootContext = require("../field/root/FieldRootContext");
var _constants = require("../field/utils/constants");
var _FieldsetRootContext = require("../fieldset/root/FieldsetRootContext");
var _FormContext = require("../form/FormContext");
var _LabelableContext = require("../labelable-provider/LabelableContext");
var _useValueChanged = require("../utils/useValueChanged");
var _RadioGroupContext = require("./RadioGroupContext");
var _jsxRuntime = require("react/jsx-runtime");
const MODIFIER_KEYS = [_composite.SHIFT];

/**
 * Provides a shared state to a series of radio buttons.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Radio Group](https://base-ui.com/react/components/radio)
 */
const RadioGroup = exports.RadioGroup = /*#__PURE__*/React.forwardRef(function RadioGroup(componentProps, forwardedRef) {
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
  } = (0, _FieldRootContext.useFieldRootContext)();
  const {
    labelId
  } = (0, _LabelableContext.useLabelableContext)();
  const {
    clearErrors
  } = (0, _FormContext.useFormContext)();
  const fieldsetContext = (0, _FieldsetRootContext.useFieldsetRootContext)(true);
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const id = (0, _useBaseUiId.useBaseUiId)(idProp);
  const [checkedValue, setCheckedValueUnwrapped] = (0, _useControlled.useControlled)({
    controlled: externalValue,
    default: defaultValue,
    name: 'RadioGroup',
    state: 'value'
  });
  const onValueChange = (0, _useStableCallback.useStableCallback)(onValueChangeProp);
  const setCheckedValue = (0, _useStableCallback.useStableCallback)((value, eventDetails) => {
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
  const registerControlRef = (0, _useStableCallback.useStableCallback)((element, isDisabled = false) => {
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
  const registerInputRef = (0, _useStableCallback.useStableCallback)(input => {
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
  (0, _useField.useField)({
    id,
    commit: validation.commit,
    value: checkedValue,
    controlRef,
    name,
    getValue: () => checkedValue ?? null
  });
  (0, _useValueChanged.useValueChanged)(checkedValue, () => {
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
      if (!(0, _utils.contains)(event.currentTarget, event.relatedTarget)) {
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_RadioGroupContext.RadioGroupContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeRoot.CompositeRoot, {
      render: render,
      className: className,
      state: state,
      props: [defaultProps, validation.getValidationProps, elementProps],
      refs: [forwardedRef],
      stateAttributesMapping: _constants.fieldValidityMapping,
      enableHomeAndEndKeys: false,
      modifierKeys: MODIFIER_KEYS
    })
  });
});
if (process.env.NODE_ENV !== "production") RadioGroup.displayName = "RadioGroup";