"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PARENT_CHECKBOX = exports.CheckboxRoot = void 0;
var React = _interopRequireWildcard(require("react"));
var _empty = require("@base-ui/utils/empty");
var _useControlled = require("@base-ui/utils/useControlled");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useMergedRefs = require("@base-ui/utils/useMergedRefs");
var _useRefWithInit = require("@base-ui/utils/useRefWithInit");
var _visuallyHidden = require("@base-ui/utils/visuallyHidden");
var _noop = require("../../utils/noop");
var _useStateAttributesMapping = require("../utils/useStateAttributesMapping");
var _useRenderElement = require("../../utils/useRenderElement");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _mergeProps = require("../../merge-props");
var _useButton = require("../../use-button/useButton");
var _FieldRootContext = require("../../field/root/FieldRootContext");
var _FieldItemContext = require("../../field/item/FieldItemContext");
var _useField = require("../../field/useField");
var _FormContext = require("../../form/FormContext");
var _LabelableContext = require("../../labelable-provider/LabelableContext");
var _useAriaLabelledBy = require("../../labelable-provider/useAriaLabelledBy");
var _CheckboxGroupContext = require("../../checkbox-group/CheckboxGroupContext");
var _CheckboxRootContext = require("./CheckboxRootContext");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _useValueChanged = require("../../utils/useValueChanged");
var _jsxRuntime = require("react/jsx-runtime");
const PARENT_CHECKBOX = exports.PARENT_CHECKBOX = 'data-parent';

/**
 * Represents the checkbox itself.
 * Renders a `<span>` element and a hidden `<input>` beside.
 *
 * Documentation: [Base UI Checkbox](https://base-ui.com/react/components/checkbox)
 */
const CheckboxRoot = exports.CheckboxRoot = /*#__PURE__*/React.forwardRef(function CheckboxRoot(componentProps, forwardedRef) {
  const {
    checked: checkedProp,
    className,
    defaultChecked = false,
    'aria-labelledby': ariaLabelledByProp,
    disabled: disabledProp = false,
    id: idProp,
    indeterminate = false,
    inputRef: inputRefProp,
    name: nameProp,
    onCheckedChange: onCheckedChangeProp,
    parent = false,
    readOnly = false,
    render,
    required = false,
    uncheckedValue,
    value: valueProp,
    nativeButton = false,
    ...elementProps
  } = componentProps;
  const {
    clearErrors
  } = (0, _FormContext.useFormContext)();
  const {
    disabled: rootDisabled,
    name: fieldName,
    setDirty,
    setFilled,
    setFocused,
    setTouched,
    state: fieldState,
    validationMode,
    validityData,
    shouldValidateOnChange,
    validation: localValidation
  } = (0, _FieldRootContext.useFieldRootContext)();
  const fieldItemContext = (0, _FieldItemContext.useFieldItemContext)();
  const {
    labelId,
    controlId,
    registerControlId,
    getDescriptionProps
  } = (0, _LabelableContext.useLabelableContext)();
  const groupContext = (0, _CheckboxGroupContext.useCheckboxGroupContext)();
  const parentContext = groupContext?.parent;
  const isGroupedWithParent = parentContext && groupContext.allValues;
  const disabled = rootDisabled || fieldItemContext.disabled || groupContext?.disabled || disabledProp;
  const name = fieldName ?? nameProp;
  const value = valueProp ?? name;
  const id = (0, _useBaseUiId.useBaseUiId)();
  const parentId = (0, _useBaseUiId.useBaseUiId)();
  let inputId = controlId;
  if (isGroupedWithParent) {
    inputId = parent ? parentId : `${parentContext.id}-${value}`;
  } else if (idProp) {
    inputId = idProp;
  }
  let groupProps = {};
  if (isGroupedWithParent) {
    if (parent) {
      groupProps = groupContext.parent.getParentProps();
    } else if (value) {
      groupProps = groupContext.parent.getChildProps(value);
    }
  }
  const onCheckedChange = (0, _useStableCallback.useStableCallback)(onCheckedChangeProp);
  const {
    checked: groupChecked = checkedProp,
    indeterminate: groupIndeterminate = indeterminate,
    onCheckedChange: groupOnChange,
    ...otherGroupProps
  } = groupProps;
  const groupValue = groupContext?.value;
  const setGroupValue = groupContext?.setValue;
  const defaultGroupValue = groupContext?.defaultValue;
  const controlRef = React.useRef(null);
  const controlSourceRef = (0, _useRefWithInit.useRefWithInit)(() => Symbol('checkbox-control'));
  const hasRegisteredRef = React.useRef(false);
  const {
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
    disabled,
    native: nativeButton
  });
  const validation = groupContext?.validation ?? localValidation;
  const [checked, setCheckedState] = (0, _useControlled.useControlled)({
    controlled: value && groupValue && !parent ? groupValue.includes(value) : groupChecked,
    default: value && defaultGroupValue && !parent ? defaultGroupValue.includes(value) : defaultChecked,
    name: 'Checkbox',
    state: 'checked'
  });

  // can't use useLabelableId because of optional groupContext and/or parent
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (registerControlId === _noop.NOOP) {
      return undefined;
    }
    hasRegisteredRef.current = true;
    registerControlId(controlSourceRef.current, inputId);
    return undefined;
  }, [inputId, groupContext, registerControlId, parent, controlSourceRef]);
  React.useEffect(() => {
    const controlSource = controlSourceRef.current;
    return () => {
      if (!hasRegisteredRef.current || registerControlId === _noop.NOOP) {
        return;
      }
      hasRegisteredRef.current = false;
      registerControlId(controlSource, undefined);
    };
  }, [registerControlId, controlSourceRef]);
  (0, _useField.useField)({
    enabled: !groupContext,
    id,
    commit: validation.commit,
    value: checked,
    controlRef,
    name,
    getValue: () => checked
  });
  const inputRef = React.useRef(null);
  const mergedInputRef = (0, _useMergedRefs.useMergedRefs)(inputRefProp, inputRef, validation.inputRef);
  const ariaLabelledBy = (0, _useAriaLabelledBy.useAriaLabelledBy)(ariaLabelledByProp, labelId, inputRef, !nativeButton, inputId ?? undefined);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = groupIndeterminate;
      if (checked) {
        setFilled(true);
      }
    }
  }, [checked, groupIndeterminate, setFilled]);
  (0, _useValueChanged.useValueChanged)(checked, () => {
    if (groupContext && !parent) {
      return;
    }
    clearErrors(name);
    setFilled(checked);
    setDirty(checked !== validityData.initialValue);
    if (shouldValidateOnChange()) {
      validation.commit(checked);
    } else {
      validation.commit(checked, true);
    }
  });
  const inputProps = (0, _mergeProps.mergeProps)({
    checked,
    disabled,
    // parent checkboxes unset `name` to be excluded from form submission
    name: parent ? undefined : name,
    // Set `id` to stop Chrome warning about an unassociated input.
    // When using a native button, the `id` is applied to the button instead.
    id: nativeButton ? undefined : inputId ?? undefined,
    required,
    ref: mergedInputRef,
    style: name ? _visuallyHidden.visuallyHiddenInput : _visuallyHidden.visuallyHidden,
    tabIndex: -1,
    type: 'checkbox',
    'aria-hidden': true,
    onChange(event) {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }
      const nextChecked = event.target.checked;
      const details = (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.none, event.nativeEvent);
      groupOnChange?.(nextChecked, details);
      onCheckedChange(nextChecked, details);
      if (details.isCanceled) {
        return;
      }
      setCheckedState(nextChecked);
      if (value && groupValue && setGroupValue && !parent) {
        const nextGroupValue = nextChecked ? [...groupValue, value] : groupValue.filter(item => item !== value);
        setGroupValue(nextGroupValue, details);
      }
    },
    onFocus() {
      controlRef.current?.focus();
    }
  },
  // React <19 sets an empty value if `undefined` is passed explicitly
  // To avoid this, we only set the value if it's defined
  valueProp !== undefined ? {
    value: (groupContext ? checked && valueProp : valueProp) || ''
  } : _empty.EMPTY_OBJECT, getDescriptionProps, groupContext ? validation.getValidationProps : validation.getInputValidationProps);
  const computedChecked = isGroupedWithParent ? Boolean(groupChecked) : checked;
  const computedIndeterminate = isGroupedWithParent ? groupIndeterminate || indeterminate : indeterminate;
  React.useEffect(() => {
    if (!parentContext || !value) {
      return undefined;
    }
    const disabledStates = parentContext.disabledStatesRef.current;
    disabledStates.set(value, disabled);
    return () => {
      disabledStates.delete(value);
    };
  }, [parentContext, disabled, value]);
  const state = React.useMemo(() => ({
    ...fieldState,
    checked: computedChecked,
    disabled,
    readOnly,
    required,
    indeterminate: computedIndeterminate
  }), [fieldState, computedChecked, disabled, readOnly, required, computedIndeterminate]);
  const stateAttributesMapping = (0, _useStateAttributesMapping.useStateAttributesMapping)(state);
  const element = (0, _useRenderElement.useRenderElement)('span', componentProps, {
    state,
    ref: [buttonRef, controlRef, forwardedRef, groupContext?.registerControlRef],
    props: [{
      id: nativeButton ? inputId ?? undefined : id,
      role: 'checkbox',
      'aria-checked': groupIndeterminate ? 'mixed' : checked,
      'aria-readonly': readOnly || undefined,
      'aria-required': required || undefined,
      'aria-labelledby': ariaLabelledBy,
      [PARENT_CHECKBOX]: parent ? '' : undefined,
      onFocus() {
        setFocused(true);
      },
      onBlur() {
        const inputEl = inputRef.current;
        if (!inputEl) {
          return;
        }
        setTouched(true);
        setFocused(false);
        if (validationMode === 'onBlur') {
          validation.commit(groupContext ? groupValue : inputEl.checked);
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
    }, getDescriptionProps, validation.getValidationProps, elementProps, otherGroupProps, getButtonProps],
    stateAttributesMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_CheckboxRootContext.CheckboxRootContext.Provider, {
    value: state,
    children: [element, !checked && !groupContext && name && !parent && uncheckedValue !== undefined && /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
      type: "hidden",
      name: name,
      value: uncheckedValue
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
      ...inputProps
    })]
  });
});
if (process.env.NODE_ENV !== "production") CheckboxRoot.displayName = "CheckboxRoot";