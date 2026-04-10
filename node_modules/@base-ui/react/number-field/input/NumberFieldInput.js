"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NumberFieldInput = void 0;
var React = _interopRequireWildcard(require("react"));
var _utils = require("../../floating-ui-react/utils");
var _NumberFieldRootContext = require("../root/NumberFieldRootContext");
var _FieldRootContext = require("../../field/root/FieldRootContext");
var _constants = require("../../field/utils/constants");
var _useField = require("../../field/useField");
var _FormContext = require("../../form/FormContext");
var _LabelableContext = require("../../labelable-provider/LabelableContext");
var _constants2 = require("../utils/constants");
var _parse = require("../utils/parse");
var _stateAttributesMapping = require("../utils/stateAttributesMapping");
var _useRenderElement = require("../../utils/useRenderElement");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _formatNumber = require("../../utils/formatNumber");
var _useValueChanged = require("../../utils/useValueChanged");
var _reasons = require("../../utils/reasons");
const stateAttributesMapping = {
  ..._constants.fieldValidityMapping,
  ..._stateAttributesMapping.stateAttributesMapping
};
const NAVIGATE_KEYS = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape']);

/**
 * The native input control in the number field.
 * Renders an `<input>` element.
 *
 * Documentation: [Base UI Number Field](https://base-ui.com/react/components/number-field)
 */
const NumberFieldInput = exports.NumberFieldInput = /*#__PURE__*/React.forwardRef(function NumberFieldInput(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    allowInputSyncRef,
    disabled,
    formatOptionsRef,
    getAllowedNonNumericKeys,
    getStepAmount,
    id,
    incrementValue,
    inputMode,
    inputValue,
    max,
    min,
    name,
    readOnly,
    required,
    setValue,
    state,
    setInputValue,
    locale,
    inputRef,
    value,
    onValueCommitted,
    lastChangedValueRef,
    hasPendingCommitRef,
    valueRef
  } = (0, _NumberFieldRootContext.useNumberFieldRootContext)();
  const {
    clearErrors
  } = (0, _FormContext.useFormContext)();
  const {
    validationMode,
    setTouched,
    setFocused,
    invalid,
    shouldValidateOnChange,
    validation
  } = (0, _FieldRootContext.useFieldRootContext)();
  const {
    labelId
  } = (0, _LabelableContext.useLabelableContext)();
  const hasTouchedInputRef = React.useRef(false);
  const blockRevalidationRef = React.useRef(false);
  (0, _useField.useField)({
    id,
    commit: validation.commit,
    value,
    controlRef: inputRef,
    name,
    getValue: () => value ?? null
  });
  (0, _useValueChanged.useValueChanged)(value, previousValue => {
    const validateOnChange = shouldValidateOnChange();
    clearErrors(name);
    if (validateOnChange) {
      validation.commit(value);
    }
    if (previousValue === value || validateOnChange) {
      return;
    }
    if (blockRevalidationRef.current) {
      blockRevalidationRef.current = false;
      return;
    }
    validation.commit(value, true);
  });
  const inputProps = {
    id,
    required,
    disabled,
    readOnly,
    inputMode,
    value: inputValue,
    type: 'text',
    autoComplete: 'off',
    autoCorrect: 'off',
    spellCheck: 'false',
    'aria-roledescription': 'Number field',
    'aria-invalid': invalid || undefined,
    'aria-labelledby': labelId,
    // If the server's locale does not match the client's locale, the formatting may not match,
    // causing a hydration mismatch.
    suppressHydrationWarning: true,
    onFocus(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }
      setFocused(true);
      if (hasTouchedInputRef.current) {
        return;
      }
      hasTouchedInputRef.current = true;

      // Browsers set selection at the start of the input field by default. We want to set it at
      // the end for the first focus.
      const target = event.currentTarget;
      const length = target.value.length;
      target.setSelectionRange(length, length);
    },
    onBlur(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }
      setTouched(true);
      setFocused(false);
      const hadManualInput = !allowInputSyncRef.current;
      const hadPendingProgrammaticChange = hasPendingCommitRef.current;
      allowInputSyncRef.current = true;
      if (inputValue.trim() === '') {
        setValue(null, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.inputClear, event.nativeEvent));
        if (validationMode === 'onBlur') {
          validation.commit(null);
        }
        onValueCommitted(null, (0, _createBaseUIEventDetails.createGenericEventDetails)(_reasons.REASONS.inputClear, event.nativeEvent));
        return;
      }
      const formatOptions = formatOptionsRef.current;
      const parsedValue = (0, _parse.parseNumber)(inputValue, locale, formatOptions);
      if (parsedValue === null) {
        return;
      }

      // If an explicit precision is requested, round the committed numeric value.
      const hasExplicitPrecision = formatOptions?.maximumFractionDigits != null || formatOptions?.minimumFractionDigits != null;
      const maxFrac = formatOptions?.maximumFractionDigits;
      const committed = hasExplicitPrecision && typeof maxFrac === 'number' ? Number(parsedValue.toFixed(maxFrac)) : parsedValue;
      const nextEventDetails = (0, _createBaseUIEventDetails.createGenericEventDetails)(_reasons.REASONS.inputBlur, event.nativeEvent);
      const shouldUpdateValue = value !== committed;
      const shouldCommit = hadManualInput || shouldUpdateValue || hadPendingProgrammaticChange;
      if (validationMode === 'onBlur') {
        validation.commit(committed);
      }
      if (shouldUpdateValue) {
        blockRevalidationRef.current = true;
        setValue(committed, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.inputBlur, event.nativeEvent));
      }
      if (shouldCommit) {
        onValueCommitted(committed, nextEventDetails);
      }

      // Normalize only the displayed text
      const canonicalText = (0, _formatNumber.formatNumber)(committed, locale, formatOptions);
      const maxPrecisionText = (0, _formatNumber.formatNumberMaxPrecision)(parsedValue, locale, formatOptions);
      const shouldPreserveFullPrecision = !hasExplicitPrecision && parsedValue === value && inputValue === maxPrecisionText;
      if (!shouldPreserveFullPrecision && inputValue !== canonicalText) {
        setInputValue(canonicalText);
      }
    },
    onChange(event) {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }
      allowInputSyncRef.current = false;
      const targetValue = event.target.value;
      if (targetValue.trim() === '') {
        setInputValue(targetValue);
        setValue(null, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.inputClear, event.nativeEvent));
        return;
      }

      // Update the input text immediately and only fire onValueChange if the typed value is
      // currently parseable into a number. This preserves good UX for IME
      // composition/partial input while still providing live numeric updates when possible.
      const allowedNonNumericKeys = getAllowedNonNumericKeys();
      const isValidCharacterString = Array.from(targetValue).every(ch => {
        const isAsciiDigit = ch >= '0' && ch <= '9';
        const isArabicNumeral = _parse.ARABIC_DETECT_RE.test(ch);
        const isHanNumeral = _parse.HAN_DETECT_RE.test(ch);
        const isPersianNumeral = _parse.PERSIAN_DETECT_RE.test(ch);
        const isFullwidthNumeral = _parse.FULLWIDTH_DETECT_RE.test(ch);
        const isMinus = _parse.ANY_MINUS_DETECT_RE.test(ch);
        return isAsciiDigit || isArabicNumeral || isHanNumeral || isPersianNumeral || isFullwidthNumeral || isMinus || allowedNonNumericKeys.has(ch);
      });
      if (!isValidCharacterString) {
        return;
      }
      const parsedValue = (0, _parse.parseNumber)(targetValue, locale, formatOptionsRef.current);
      setInputValue(targetValue);
      if (parsedValue !== null) {
        setValue(parsedValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.inputChange, event.nativeEvent));
      }
    },
    onKeyDown(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }
      const nativeEvent = event.nativeEvent;
      allowInputSyncRef.current = true;
      const allowedNonNumericKeys = getAllowedNonNumericKeys();
      let isAllowedNonNumericKey = allowedNonNumericKeys.has(event.key);
      const {
        decimal,
        currency,
        percentSign
      } = (0, _parse.getNumberLocaleDetails)(locale, formatOptionsRef.current);
      const selectionStart = event.currentTarget.selectionStart;
      const selectionEnd = event.currentTarget.selectionEnd;
      const isAllSelected = selectionStart === 0 && selectionEnd === inputValue.length;

      // Normalize handling of plus/minus signs via precomputed regexes
      const selectionContainsIndex = index => selectionStart != null && selectionEnd != null && index >= selectionStart && index < selectionEnd;
      if (_parse.ANY_MINUS_DETECT_RE.test(event.key) && Array.from(allowedNonNumericKeys).some(k => _parse.ANY_MINUS_DETECT_RE.test(k || ''))) {
        // Only allow one sign unless replacing the existing one or all text is selected
        const existingIndex = inputValue.search(_parse.ANY_MINUS_RE);
        const isReplacingExisting = existingIndex != null && existingIndex !== -1 && selectionContainsIndex(existingIndex);
        isAllowedNonNumericKey = !(_parse.ANY_MINUS_DETECT_RE.test(inputValue) || _parse.ANY_PLUS_DETECT_RE.test(inputValue)) || isAllSelected || isReplacingExisting;
      }
      if (_parse.ANY_PLUS_DETECT_RE.test(event.key) && Array.from(allowedNonNumericKeys).some(k => _parse.ANY_PLUS_DETECT_RE.test(k || ''))) {
        const existingIndex = inputValue.search(_parse.ANY_PLUS_RE);
        const isReplacingExisting = existingIndex != null && existingIndex !== -1 && selectionContainsIndex(existingIndex);
        isAllowedNonNumericKey = !(_parse.ANY_MINUS_DETECT_RE.test(inputValue) || _parse.ANY_PLUS_DETECT_RE.test(inputValue)) || isAllSelected || isReplacingExisting;
      }

      // Only allow one of each symbol.
      [decimal, currency, percentSign].forEach(symbol => {
        if (event.key === symbol) {
          const symbolIndex = inputValue.indexOf(symbol);
          const isSymbolHighlighted = selectionContainsIndex(symbolIndex);
          isAllowedNonNumericKey = !inputValue.includes(symbol) || isAllSelected || isSymbolHighlighted;
        }
      });
      const isAsciiDigit = event.key >= '0' && event.key <= '9';
      const isArabicNumeral = _parse.ARABIC_DETECT_RE.test(event.key);
      const isHanNumeral = _parse.HAN_DETECT_RE.test(event.key);
      const isFullwidthNumeral = _parse.FULLWIDTH_DETECT_RE.test(event.key);
      const isNavigateKey = NAVIGATE_KEYS.has(event.key);
      if (
      // Allow composition events (e.g., pinyin)
      // event.nativeEvent.isComposing does not work in Safari:
      // https://bugs.webkit.org/show_bug.cgi?id=165004
      event.which === 229 || event.altKey || event.ctrlKey || event.metaKey || isAllowedNonNumericKey || isAsciiDigit || isArabicNumeral || isFullwidthNumeral || isHanNumeral || isNavigateKey) {
        return;
      }

      // We need to commit the number at this point if the input hasn't been blurred.
      const parsedValue = (0, _parse.parseNumber)(inputValue, locale, formatOptionsRef.current);
      const amount = getStepAmount(event) ?? _constants2.DEFAULT_STEP;

      // Prevent insertion of text or caret from moving.
      (0, _utils.stopEvent)(event);
      const commitDetails = (0, _createBaseUIEventDetails.createGenericEventDetails)(_reasons.REASONS.keyboard, nativeEvent);
      if (event.key === 'ArrowUp') {
        incrementValue(amount, {
          direction: 1,
          currentValue: parsedValue,
          event: nativeEvent,
          reason: _reasons.REASONS.keyboard
        });
        onValueCommitted(lastChangedValueRef.current ?? valueRef.current, commitDetails);
      } else if (event.key === 'ArrowDown') {
        incrementValue(amount, {
          direction: -1,
          currentValue: parsedValue,
          event: nativeEvent,
          reason: _reasons.REASONS.keyboard
        });
        onValueCommitted(lastChangedValueRef.current ?? valueRef.current, commitDetails);
      } else if (event.key === 'Home' && min != null) {
        setValue(min, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.keyboard, nativeEvent));
        onValueCommitted(lastChangedValueRef.current ?? valueRef.current, commitDetails);
      } else if (event.key === 'End' && max != null) {
        setValue(max, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.keyboard, nativeEvent));
        onValueCommitted(lastChangedValueRef.current ?? valueRef.current, commitDetails);
      }
    },
    onPaste(event) {
      if (event.defaultPrevented || readOnly || disabled) {
        return;
      }

      // Prevent `onChange` from being called.
      event.preventDefault();
      const clipboardData = event.clipboardData || window.Clipboard;
      const pastedData = clipboardData.getData('text/plain');
      const parsedValue = (0, _parse.parseNumber)(pastedData, locale, formatOptionsRef.current);
      if (parsedValue !== null) {
        allowInputSyncRef.current = false;
        setValue(parsedValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.inputPaste, event.nativeEvent));
        setInputValue(pastedData);
      }
    }
  };
  const element = (0, _useRenderElement.useRenderElement)('input', componentProps, {
    ref: [forwardedRef, inputRef],
    state,
    props: [inputProps, validation.getValidationProps(), elementProps],
    stateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") NumberFieldInput.displayName = "NumberFieldInput";