"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NumberFieldRoot = void 0;
var React = _interopRequireWildcard(require("react"));
var _useControlled = require("@base-ui/utils/useControlled");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _useInterval = require("@base-ui/utils/useInterval");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useValueAsRef = require("@base-ui/utils/useValueAsRef");
var _useForcedRerendering = require("@base-ui/utils/useForcedRerendering");
var _useMergedRefs = require("@base-ui/utils/useMergedRefs");
var _visuallyHidden = require("@base-ui/utils/visuallyHidden");
var _owner = require("@base-ui/utils/owner");
var _detectBrowser = require("@base-ui/utils/detectBrowser");
var _NumberFieldRootContext = require("./NumberFieldRootContext");
var _FieldRootContext = require("../../field/root/FieldRootContext");
var _useLabelableId = require("../../labelable-provider/useLabelableId");
var _stateAttributesMapping = require("../utils/stateAttributesMapping");
var _useRenderElement = require("../../utils/useRenderElement");
var _parse = require("../utils/parse");
var _formatNumber = require("../../utils/formatNumber");
var _constants = require("../utils/constants");
var _validate = require("../utils/validate");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups all parts of the number field and manages its state.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldRoot = exports.NumberFieldRoot = /*#__PURE__*/React.forwardRef(function NumberFieldRoot(componentProps, forwardedRef) {
  const {
    id: idProp,
    min,
    max,
    smallStep = 0.1,
    step: stepProp = 1,
    largeStep = 10,
    required = false,
    disabled: disabledProp = false,
    readOnly = false,
    name: nameProp,
    defaultValue,
    value: valueProp,
    onValueChange: onValueChangeProp,
    onValueCommitted: onValueCommittedProp,
    allowWheelScrub = false,
    snapOnStep = false,
    allowOutOfRange = false,
    format,
    locale,
    render,
    className,
    inputRef: inputRefProp,
    ...elementProps
  } = componentProps;
  const {
    setDirty,
    validityData,
    disabled: fieldDisabled,
    setFilled,
    invalid,
    name: fieldName,
    state: fieldState,
    validation,
    shouldValidateOnChange
  } = (0, _FieldRootContext.useFieldRootContext)();
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const step = stepProp === 'any' ? 1 : stepProp;
  const [isScrubbing, setIsScrubbing] = React.useState(false);
  const minWithDefault = min ?? Number.MIN_SAFE_INTEGER;
  const maxWithDefault = max ?? Number.MAX_SAFE_INTEGER;
  const minWithZeroDefault = min ?? 0;
  const formatStyle = format?.style;
  const inputRef = React.useRef(null);
  const hiddenInputRef = (0, _useMergedRefs.useMergedRefs)(inputRefProp, validation.inputRef);
  const id = (0, _useLabelableId.useLabelableId)({
    id: idProp
  });
  const [valueUnwrapped, setValueUnwrapped] = (0, _useControlled.useControlled)({
    controlled: valueProp,
    default: defaultValue,
    name: 'NumberField',
    state: 'value'
  });
  const value = valueUnwrapped ?? null;
  const valueRef = (0, _useValueAsRef.useValueAsRef)(value);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    setFilled(value !== null);
  }, [setFilled, value]);
  const forceRender = (0, _useForcedRerendering.useForcedRerendering)();
  const formatOptionsRef = (0, _useValueAsRef.useValueAsRef)(format);
  const hasPendingCommitRef = React.useRef(false);
  const onValueCommitted = (0, _useStableCallback.useStableCallback)((nextValue, eventDetails) => {
    hasPendingCommitRef.current = false;
    onValueCommittedProp?.(nextValue, eventDetails);
  });
  const startTickTimeout = (0, _useTimeout.useTimeout)();
  const tickInterval = (0, _useInterval.useInterval)();
  const intentionalTouchCheckTimeout = (0, _useTimeout.useTimeout)();
  const isPressedRef = React.useRef(false);
  const movesAfterTouchRef = React.useRef(0);
  const allowInputSyncRef = React.useRef(true);
  const lastChangedValueRef = React.useRef(null);
  const unsubscribeFromGlobalContextMenuRef = React.useRef(() => {});

  // During SSR, the value is formatted on the server, whose locale may differ from the client's
  // locale. This causes a hydration mismatch, which we manually suppress. This is preferable to
  // rendering an empty input field and then updating it with the formatted value, as the user
  // can still see the value prior to hydration, even if it's not formatted correctly.
  const [inputValue, setInputValue] = React.useState(() => {
    if (valueProp !== undefined) {
      return getControlledInputValue(value, locale, format);
    }
    return (0, _formatNumber.formatNumber)(value, locale, format);
  });
  const [inputMode, setInputMode] = React.useState('numeric');
  const getAllowedNonNumericKeys = (0, _useStableCallback.useStableCallback)(() => {
    const {
      decimal,
      group,
      currency,
      literal
    } = (0, _parse.getNumberLocaleDetails)(locale, format);
    const keys = new Set();
    _parse.BASE_NON_NUMERIC_SYMBOLS.forEach(symbol => keys.add(symbol));
    if (decimal) {
      keys.add(decimal);
    }
    if (group) {
      keys.add(group);
      if (_parse.SPACE_SEPARATOR_RE.test(group)) {
        keys.add(' ');
      }
    }
    const allowPercentSymbols = formatStyle === 'percent' || formatStyle === 'unit' && format?.unit === 'percent';
    const allowPermilleSymbols = formatStyle === 'percent' || formatStyle === 'unit' && format?.unit === 'permille';
    if (allowPercentSymbols) {
      _parse.PERCENTAGES.forEach(key => keys.add(key));
    }
    if (allowPermilleSymbols) {
      _parse.PERMILLE.forEach(key => keys.add(key));
    }
    if (formatStyle === 'currency' && currency) {
      keys.add(currency);
    }
    if (literal) {
      // Some locales (e.g. de-DE) insert a literal space character between the number
      // and the symbol, so allow those characters to be typed/removed.
      Array.from(literal).forEach(char => keys.add(char));
      if (_parse.SPACE_SEPARATOR_RE.test(literal)) {
        keys.add(' ');
      }
    }

    // Allow plus sign in all cases; minus sign only when negatives are valid
    _parse.PLUS_SIGNS_WITH_ASCII.forEach(key => keys.add(key));
    if (minWithDefault < 0) {
      _parse.MINUS_SIGNS_WITH_ASCII.forEach(key => keys.add(key));
    }
    return keys;
  });
  const getStepAmount = (0, _useStableCallback.useStableCallback)(event => {
    if (event?.altKey) {
      return smallStep;
    }
    if (event?.shiftKey) {
      return largeStep;
    }
    return step;
  });
  const setValue = (0, _useStableCallback.useStableCallback)((unvalidatedValue, details) => {
    const eventWithOptionalKeyState = details.event;
    const dir = details.direction;
    const reason = details.reason;
    // Only allow out-of-range values for direct text entry (native-like behavior).
    // Step-based interactions (keyboard arrows, buttons, wheel, scrub) still clamp to min/max.
    const shouldClampValue = !allowOutOfRange || !(reason === _reasons.REASONS.inputChange || reason === _reasons.REASONS.inputBlur || reason === _reasons.REASONS.inputPaste || reason === _reasons.REASONS.inputClear || reason === _reasons.REASONS.none);
    const validatedValue = (0, _validate.toValidatedNumber)(unvalidatedValue, {
      step: dir ? getStepAmount(eventWithOptionalKeyState) * dir : undefined,
      format: formatOptionsRef.current,
      minWithDefault,
      maxWithDefault,
      minWithZeroDefault,
      snapOnStep,
      small: eventWithOptionalKeyState?.altKey ?? false,
      clamp: shouldClampValue
    });

    // Determine whether we should notify about a change even if the numeric value is unchanged.
    // This is needed when the user input is clamped/snapped to the same current value, or when
    // the source value differs but validation normalizes to the existing value.
    const isInputReason = details.reason === _reasons.REASONS.inputChange || details.reason === _reasons.REASONS.inputClear || details.reason === _reasons.REASONS.inputBlur || details.reason === _reasons.REASONS.inputPaste || details.reason === _reasons.REASONS.none;
    const shouldFireChange = validatedValue !== value || isInputReason && (unvalidatedValue !== value || allowInputSyncRef.current === false);
    if (shouldFireChange) {
      lastChangedValueRef.current = validatedValue;
      onValueChangeProp?.(validatedValue, details);
      if (details.isCanceled) {
        return shouldFireChange;
      }
      setValueUnwrapped(validatedValue);
      setDirty(validatedValue !== validityData.initialValue);
      hasPendingCommitRef.current = true;
    }

    // Keep the visible input in sync immediately when programmatic changes occur
    // (increment/decrement, wheel, etc). During direct typing we don't want
    // to overwrite the user-provided text until blur, so we gate on
    // `allowInputSyncRef`.
    if (allowInputSyncRef.current) {
      setInputValue((0, _formatNumber.formatNumber)(validatedValue, locale, format));
    }

    // Formatting can change even if the numeric value hasn't, so ensure a re-render when needed.
    forceRender();
    return shouldFireChange;
  });
  const incrementValue = (0, _useStableCallback.useStableCallback)((amount, {
    direction,
    currentValue,
    event,
    reason
  }) => {
    const prevValue = currentValue == null ? valueRef.current : currentValue;
    const nextValue = typeof prevValue === 'number' ? prevValue + amount * direction : Math.max(0, min ?? 0);
    const nativeEvent = event;
    return setValue(nextValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(reason, nativeEvent, undefined, {
      direction
    }));
  });
  const stopAutoChange = (0, _useStableCallback.useStableCallback)(() => {
    intentionalTouchCheckTimeout.clear();
    startTickTimeout.clear();
    tickInterval.clear();
    unsubscribeFromGlobalContextMenuRef.current();
    movesAfterTouchRef.current = 0;
  });
  const startAutoChange = (0, _useStableCallback.useStableCallback)((isIncrement, triggerEvent) => {
    stopAutoChange();
    if (!inputRef.current) {
      return;
    }
    const win = (0, _owner.ownerWindow)(inputRef.current);
    function handleContextMenu(event) {
      event.preventDefault();
    }

    // A global context menu is necessary to prevent the context menu from appearing when the touch
    // is slightly outside of the element's hit area.
    win.addEventListener('contextmenu', handleContextMenu);
    unsubscribeFromGlobalContextMenuRef.current = () => {
      win.removeEventListener('contextmenu', handleContextMenu);
    };
    win.addEventListener('pointerup', event => {
      isPressedRef.current = false;
      stopAutoChange();
      const committed = lastChangedValueRef.current ?? valueRef.current;
      const commitReason = isIncrement ? _reasons.REASONS.incrementPress : _reasons.REASONS.decrementPress;
      onValueCommitted(committed, (0, _createBaseUIEventDetails.createGenericEventDetails)(commitReason, event));
    }, {
      once: true
    });
    function tick() {
      const amount = getStepAmount(triggerEvent) ?? _constants.DEFAULT_STEP;
      return incrementValue(amount, {
        direction: isIncrement ? 1 : -1,
        event: triggerEvent,
        reason: isIncrement ? 'increment-press' : 'decrement-press'
      });
    }
    if (!tick()) {
      stopAutoChange();
      return;
    }
    startTickTimeout.start(_constants.START_AUTO_CHANGE_DELAY, () => {
      tickInterval.start(_constants.CHANGE_VALUE_TICK_DELAY, () => {
        if (!tick()) {
          stopAutoChange();
        }
      });
    });
  });

  // We need to update the input value when the external `value` prop changes. This ends up acting
  // as a single source of truth to update the input value, bypassing the need to manually set it in
  // each event handler internally in this hook.
  // This is done inside a layout effect as an alternative to the technique to set state during
  // render as we're accessing a ref, which must be inside an effect.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  //
  // ESLint is disabled because it needs to run even if the parsed value hasn't changed, since the
  // value still can be formatted differently.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(function syncFormattedInputValueOnValueChange() {
    // This ensures the value is only updated on blur rather than every keystroke, but still
    // allows the input value to be updated when the value is changed externally.
    if (!allowInputSyncRef.current) {
      return;
    }
    const nextInputValue = valueProp !== undefined ? getControlledInputValue(value, locale, format) : (0, _formatNumber.formatNumber)(value, locale, format);
    if (nextInputValue !== inputValue) {
      setInputValue(nextInputValue);
    }
  });
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(function setDynamicInputModeForIOS() {
    if (!_detectBrowser.isIOS) {
      return;
    }

    // iOS numeric software keyboard doesn't have a minus key, so we need to use the default
    // keyboard to let the user input a negative number.
    let computedInputMode = 'text';
    if (minWithDefault >= 0) {
      // iOS numeric software keyboard doesn't have a decimal key for "numeric" input mode, but
      // this is better than the "text" input if possible to use.
      computedInputMode = 'decimal';
    }
    setInputMode(computedInputMode);
  }, [minWithDefault, formatStyle]);
  React.useEffect(() => {
    return () => stopAutoChange();
  }, [stopAutoChange]);

  // The `onWheel` prop can't be prevented, so we need to use a global event listener.
  React.useEffect(function registerElementWheelListener() {
    const element = inputRef.current;
    if (disabled || readOnly || !allowWheelScrub || !element) {
      return undefined;
    }
    function handleWheel(event) {
      if (
      // Allow pinch-zooming.
      event.ctrlKey || (0, _owner.ownerDocument)(inputRef.current).activeElement !== inputRef.current) {
        return;
      }

      // Prevent the default behavior to avoid scrolling the page.
      event.preventDefault();
      const amount = getStepAmount(event) ?? _constants.DEFAULT_STEP;
      incrementValue(amount, {
        direction: event.deltaY > 0 ? -1 : 1,
        event,
        reason: 'wheel'
      });
    }
    element.addEventListener('wheel', handleWheel);
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [allowWheelScrub, incrementValue, disabled, readOnly, largeStep, step, getStepAmount]);
  const state = React.useMemo(() => ({
    ...fieldState,
    disabled,
    readOnly,
    required,
    value,
    inputValue,
    scrubbing: isScrubbing
  }), [fieldState, disabled, readOnly, required, value, inputValue, isScrubbing]);
  const contextValue = React.useMemo(() => ({
    inputRef,
    inputValue,
    value,
    startAutoChange,
    stopAutoChange,
    minWithDefault,
    maxWithDefault,
    disabled,
    readOnly,
    id,
    setValue,
    incrementValue,
    getStepAmount,
    allowInputSyncRef,
    formatOptionsRef,
    valueRef,
    lastChangedValueRef,
    hasPendingCommitRef,
    isPressedRef,
    intentionalTouchCheckTimeout,
    movesAfterTouchRef,
    name,
    required,
    invalid,
    inputMode,
    getAllowedNonNumericKeys,
    min,
    max,
    setInputValue,
    locale,
    isScrubbing,
    setIsScrubbing,
    state,
    onValueCommitted
  }), [inputRef, inputValue, value, startAutoChange, stopAutoChange, minWithDefault, maxWithDefault, disabled, readOnly, id, setValue, incrementValue, getStepAmount, formatOptionsRef, valueRef, intentionalTouchCheckTimeout, name, required, invalid, inputMode, getAllowedNonNumericKeys, min, max, setInputValue, locale, isScrubbing, state, onValueCommitted]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping: _stateAttributesMapping.stateAttributesMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_NumberFieldRootContext.NumberFieldRootContext.Provider, {
    value: contextValue,
    children: [element, /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
      ...validation.getInputValidationProps({
        onFocus() {
          inputRef.current?.focus();
        },
        onChange(event) {
          // Workaround for https://github.com/facebook/react/issues/9023
          if (event.nativeEvent.defaultPrevented) {
            return;
          }

          // Handle browser autofill.
          const nextValue = event.currentTarget.valueAsNumber;
          const parsedValue = Number.isNaN(nextValue) ? null : nextValue;
          const details = (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.none, event.nativeEvent);
          setDirty(parsedValue !== validityData.initialValue);
          setValue(parsedValue, details);
          if (shouldValidateOnChange()) {
            validation.commit(parsedValue);
          }
        }
      }),
      ref: hiddenInputRef,
      type: "number",
      name: name,
      value: value ?? '',
      min: min,
      max: max
      // stepMismatch validation is broken unless an explicit `min` is added.
      // See https://github.com/facebook/react/issues/12334.
      ,
      step: stepProp,
      disabled: disabled,
      required: required,
      "aria-hidden": true,
      tabIndex: -1,
      style: name ? _visuallyHidden.visuallyHiddenInput : _visuallyHidden.visuallyHidden
    })]
  });
});
if (process.env.NODE_ENV !== "production") NumberFieldRoot.displayName = "NumberFieldRoot";
function getControlledInputValue(value, locale, format) {
  const explicitPrecision = format?.maximumFractionDigits != null || format?.minimumFractionDigits != null;
  return explicitPrecision ? (0, _formatNumber.formatNumber)(value, locale, format) : (0, _formatNumber.formatNumberMaxPrecision)(value, locale, format);
}