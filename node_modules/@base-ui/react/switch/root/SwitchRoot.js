"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SwitchRoot = void 0;
var React = _interopRequireWildcard(require("react"));
var _useControlled = require("@base-ui/utils/useControlled");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useMergedRefs = require("@base-ui/utils/useMergedRefs");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _visuallyHidden = require("@base-ui/utils/visuallyHidden");
var _empty = require("@base-ui/utils/empty");
var _useRenderElement = require("../../utils/useRenderElement");
var _mergeProps = require("../../merge-props");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _useButton = require("../../use-button");
var _SwitchRootContext = require("./SwitchRootContext");
var _stateAttributesMapping = require("../stateAttributesMapping");
var _useField = require("../../field/useField");
var _FieldRootContext = require("../../field/root/FieldRootContext");
var _FormContext = require("../../form/FormContext");
var _LabelableContext = require("../../labelable-provider/LabelableContext");
var _useAriaLabelledBy = require("../../labelable-provider/useAriaLabelledBy");
var _useLabelableId = require("../../labelable-provider/useLabelableId");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _useValueChanged = require("../../utils/useValueChanged");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Represents the switch itself.
 * Renders a `<span>` element and a hidden `<input>` beside.
 *
 * Documentation: [Base UI Switch](https://base-ui.com/react/components/switch)
 */
const SwitchRoot = exports.SwitchRoot = /*#__PURE__*/React.forwardRef(function SwitchRoot(componentProps, forwardedRef) {
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
  } = (0, _FormContext.useFormContext)();
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
  } = (0, _FieldRootContext.useFieldRootContext)();
  const {
    labelId
  } = (0, _LabelableContext.useLabelableContext)();
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const onCheckedChange = (0, _useStableCallback.useStableCallback)(onCheckedChangeProp);
  const inputRef = React.useRef(null);
  const handleInputRef = (0, _useMergedRefs.useMergedRefs)(inputRef, externalInputRef, validation.inputRef);
  const switchRef = React.useRef(null);
  const id = (0, _useBaseUiId.useBaseUiId)();
  const controlId = (0, _useLabelableId.useLabelableId)({
    id: idProp,
    implicit: false,
    controlRef: switchRef
  });
  const hiddenInputId = nativeButton ? undefined : controlId;
  const [checked, setCheckedState] = (0, _useControlled.useControlled)({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: 'Switch',
    state: 'checked'
  });
  (0, _useField.useField)({
    id,
    commit: validation.commit,
    value: checked,
    controlRef: switchRef,
    name,
    getValue: () => checked
  });
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (inputRef.current) {
      setFilled(inputRef.current.checked);
    }
  }, [inputRef, setFilled]);
  (0, _useValueChanged.useValueChanged)(checked, () => {
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
  } = (0, _useButton.useButton)({
    disabled,
    native: nativeButton
  });
  const ariaLabelledBy = (0, _useAriaLabelledBy.useAriaLabelledBy)(ariaLabelledByProp, labelId, inputRef, !nativeButton, hiddenInputId);
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
  const inputProps = React.useMemo(() => (0, _mergeProps.mergeProps)({
    checked,
    disabled,
    id: hiddenInputId,
    name,
    required,
    style: name ? _visuallyHidden.visuallyHiddenInput : _visuallyHidden.visuallyHidden,
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
      const eventDetails = (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.none, event.nativeEvent);
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
  } : _empty.EMPTY_OBJECT), [checked, disabled, handleInputRef, hiddenInputId, name, onCheckedChange, required, setCheckedState, validation, value]);
  const state = React.useMemo(() => ({
    ...fieldState,
    checked,
    disabled,
    readOnly,
    required
  }), [fieldState, checked, disabled, readOnly, required]);
  const element = (0, _useRenderElement.useRenderElement)('span', componentProps, {
    state,
    ref: [forwardedRef, switchRef, buttonRef],
    props: [rootProps, validation.getValidationProps, elementProps, getButtonProps],
    stateAttributesMapping: _stateAttributesMapping.stateAttributesMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_SwitchRootContext.SwitchRootContext.Provider, {
    value: state,
    children: [element, !checked && name && uncheckedValue !== undefined && /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
      type: "hidden",
      name: name,
      value: uncheckedValue
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
      ...inputProps
    })]
  });
});
if (process.env.NODE_ENV !== "production") SwitchRoot.displayName = "SwitchRoot";