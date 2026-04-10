"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldRoot = void 0;
var React = _interopRequireWildcard(require("react"));
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _FieldRootContext = require("./FieldRootContext");
var _constants = require("../utils/constants");
var _FieldsetRootContext = require("../../fieldset/root/FieldsetRootContext");
var _FormContext = require("../../form/FormContext");
var _labelableProvider = require("../../labelable-provider");
var _useRenderElement = require("../../utils/useRenderElement");
var _useFieldValidation = require("./useFieldValidation");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * @internal
 */const FieldRootInner = /*#__PURE__*/React.forwardRef(function FieldRootInner(componentProps, forwardedRef) {
  const {
    errors,
    validationMode: formValidationMode,
    submitAttemptedRef
  } = (0, _FormContext.useFormContext)();
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
  } = (0, _FieldsetRootContext.useFieldsetRootContext)();
  const validate = (0, _useStableCallback.useStableCallback)(validateProp || (() => null));
  const disabled = disabledFieldset || disabledProp;
  const [touchedState, setTouchedUnwrapped] = React.useState(false);
  const [dirtyState, setDirtyUnwrapped] = React.useState(false);
  const [filled, setFilled] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const dirty = dirtyProp ?? dirtyState;
  const touched = touchedProp ?? touchedState;
  const markedDirtyRef = React.useRef(false);
  const setDirty = (0, _useStableCallback.useStableCallback)(value => {
    if (dirtyProp !== undefined) {
      return;
    }
    if (value) {
      markedDirtyRef.current = true;
    }
    setDirtyUnwrapped(value);
  });
  const setTouched = (0, _useStableCallback.useStableCallback)(value => {
    if (touchedProp !== undefined) {
      return;
    }
    setTouchedUnwrapped(value);
  });
  const shouldValidateOnChange = (0, _useStableCallback.useStableCallback)(() => validationMode === 'onChange' || validationMode === 'onSubmit' && submitAttemptedRef.current);
  const hasFormError = !!name && Object.hasOwn(errors, name) && errors[name] !== undefined;
  const invalid = invalidProp === true || hasFormError;
  const [validityData, setValidityData] = React.useState({
    state: _constants.DEFAULT_VALIDITY_STATE,
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
  const validation = (0, _useFieldValidation.useFieldValidation)({
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
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping: _constants.fieldValidityMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_FieldRootContext.FieldRootContext.Provider, {
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
const FieldRoot = exports.FieldRoot = /*#__PURE__*/React.forwardRef(function FieldRoot(componentProps, forwardedRef) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_labelableProvider.LabelableProvider, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(FieldRootInner, {
      ...componentProps,
      ref: forwardedRef
    })
  });
});
if (process.env.NODE_ENV !== "production") FieldRoot.displayName = "FieldRoot";