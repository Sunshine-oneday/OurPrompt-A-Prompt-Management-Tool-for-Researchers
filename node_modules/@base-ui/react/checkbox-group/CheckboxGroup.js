"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckboxGroup = void 0;
var React = _interopRequireWildcard(require("react"));
var _useControlled = require("@base-ui/utils/useControlled");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useBaseUiId = require("../utils/useBaseUiId");
var _useRenderElement = require("../utils/useRenderElement");
var _CheckboxGroupContext = require("./CheckboxGroupContext");
var _FieldRootContext = require("../field/root/FieldRootContext");
var _LabelableContext = require("../labelable-provider/LabelableContext");
var _constants = require("../field/utils/constants");
var _useField = require("../field/useField");
var _CheckboxRoot = require("../checkbox/root/CheckboxRoot");
var _useCheckboxGroupParent = require("./useCheckboxGroupParent");
var _FormContext = require("../form/FormContext");
var _useValueChanged = require("../utils/useValueChanged");
var _areArraysEqual = require("../utils/areArraysEqual");
var _constants2 = require("../utils/constants");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Provides a shared state to a series of checkboxes.
 *
 * Documentation: [Base UI Checkbox Group](https://base-ui.com/react/components/checkbox-group)
 */
const CheckboxGroup = exports.CheckboxGroup = /*#__PURE__*/React.forwardRef(function CheckboxGroup(componentProps, forwardedRef) {
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
  } = (0, _FieldRootContext.useFieldRootContext)();
  const {
    labelId,
    getDescriptionProps
  } = (0, _LabelableContext.useLabelableContext)();
  const {
    clearErrors
  } = (0, _FormContext.useFormContext)();
  const disabled = fieldDisabled || disabledProp;
  const [value, setValueUnwrapped] = (0, _useControlled.useControlled)({
    controlled: externalValue,
    default: defaultValue,
    name: 'CheckboxGroup',
    state: 'value'
  });
  const setValue = (0, _useStableCallback.useStableCallback)((v, eventDetails) => {
    onValueChange?.(v, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setValueUnwrapped(v);
  });
  const parent = (0, _useCheckboxGroupParent.useCheckboxGroupParent)({
    allValues,
    value: externalValue,
    onValueChange
  });
  const id = (0, _useBaseUiId.useBaseUiId)(idProp);
  const controlRef = React.useRef(null);
  const registerControlRef = React.useCallback(element => {
    if (controlRef.current == null && element != null && !element.hasAttribute(_CheckboxRoot.PARENT_CHECKBOX)) {
      controlRef.current = element;
    }
  }, []);
  (0, _useField.useField)({
    enabled: !!fieldName,
    id,
    commit: validation.commit,
    value,
    controlRef,
    name: fieldName,
    getValue: () => value
  });
  const resolvedValue = value ?? _constants2.EMPTY_ARRAY;
  (0, _useValueChanged.useValueChanged)(resolvedValue, () => {
    if (fieldName) {
      clearErrors(fieldName);
    }
    const initialValue = Array.isArray(validityData.initialValue) ? validityData.initialValue : _constants2.EMPTY_ARRAY;
    setFilled(resolvedValue.length > 0);
    setDirty(!(0, _areArraysEqual.areArraysEqual)(resolvedValue, initialValue));
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
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      role: 'group',
      'aria-labelledby': labelId
    }, getDescriptionProps, elementProps],
    stateAttributesMapping: _constants.fieldValidityMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_CheckboxGroupContext.CheckboxGroupContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") CheckboxGroup.displayName = "CheckboxGroup";