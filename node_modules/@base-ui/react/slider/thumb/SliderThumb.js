"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SliderThumb = void 0;
var React = _interopRequireWildcard(require("react"));
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useOnMount = require("@base-ui/utils/useOnMount");
var _useMergedRefs = require("@base-ui/utils/useMergedRefs");
var _visuallyHidden = require("@base-ui/utils/visuallyHidden");
var _formatNumber = require("../../utils/formatNumber");
var _mergeProps = require("../../merge-props");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _useRenderElement = require("../../utils/useRenderElement");
var _valueToPercent = require("../../utils/valueToPercent");
var _composite = require("../../composite/composite");
var _useCompositeListItem = require("../../composite/list/useCompositeListItem");
var _DirectionContext = require("../../direction-provider/DirectionContext");
var _CSPContext = require("../../csp-provider/CSPContext");
var _FieldRootContext = require("../../field/root/FieldRootContext");
var _useLabelableId = require("../../labelable-provider/useLabelableId");
var _getMidpoint = require("../utils/getMidpoint");
var _getSliderValue = require("../utils/getSliderValue");
var _roundValueToStep = require("../utils/roundValueToStep");
var _SliderRootContext = require("../root/SliderRootContext");
var _stateAttributesMapping = require("../root/stateAttributesMapping");
var _SliderThumbDataAttributes = require("./SliderThumbDataAttributes");
var _prehydrationScript = require("./prehydrationScript.min");
var _jsxRuntime = require("react/jsx-runtime");
const PAGE_UP = 'PageUp';
const PAGE_DOWN = 'PageDown';
const ALL_KEYS = new Set([_composite.ARROW_UP, _composite.ARROW_DOWN, _composite.ARROW_LEFT, _composite.ARROW_RIGHT, _composite.HOME, _composite.END, PAGE_UP, PAGE_DOWN]);
function getDefaultAriaValueText(values, index, format, locale) {
  if (index < 0) {
    return undefined;
  }
  if (values.length === 2) {
    if (index === 0) {
      return `${(0, _formatNumber.formatNumber)(values[index], locale, format)} start range`;
    }
    return `${(0, _formatNumber.formatNumber)(values[index], locale, format)} end range`;
  }
  return format ? (0, _formatNumber.formatNumber)(values[index], locale, format) : undefined;
}
function getNewValue(thumbValue, step, direction, min, max) {
  return direction === 1 ? Math.min(thumbValue + step, max) : Math.max(thumbValue - step, min);
}

/**
 * The draggable part of the slider at the tip of the indicator.
 * Renders a `<div>` element and a nested `<input type="range">`.
 *
 * Documentation: [Base UI Slider](https://base-ui.com/react/components/slider)
 */
const SliderThumb = exports.SliderThumb = /*#__PURE__*/React.forwardRef(function SliderThumb(componentProps, forwardedRef) {
  const {
    render,
    children: childrenProp,
    className,
    'aria-describedby': ariaDescribedByProp,
    'aria-label': ariaLabelProp,
    'aria-labelledby': ariaLabelledByProp,
    disabled: disabledProp = false,
    getAriaLabel: getAriaLabelProp,
    getAriaValueText: getAriaValueTextProp,
    id: idProp,
    index: indexProp,
    inputRef: inputRefProp,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    tabIndex: tabIndexProp,
    ...elementProps
  } = componentProps;
  const {
    nonce
  } = (0, _CSPContext.useCSPContext)();
  const id = (0, _useBaseUiId.useBaseUiId)(idProp);
  const {
    active: activeIndex,
    lastUsedThumbIndex,
    controlRef,
    disabled: contextDisabled,
    validation,
    formatOptionsRef,
    handleInputChange,
    inset,
    labelId,
    largeStep,
    locale,
    max,
    min,
    minStepsBetweenValues,
    name,
    orientation,
    pressedInputRef,
    pressedThumbCenterOffsetRef,
    pressedThumbIndexRef,
    renderBeforeHydration,
    setActive,
    setIndicatorPosition,
    state,
    step,
    values: sliderValues
  } = (0, _SliderRootContext.useSliderRootContext)();
  const direction = (0, _DirectionContext.useDirection)();
  const disabled = disabledProp || contextDisabled;
  const range = sliderValues.length > 1;
  const vertical = orientation === 'vertical';
  const rtl = direction === 'rtl';
  const {
    setTouched,
    setFocused,
    validationMode
  } = (0, _FieldRootContext.useFieldRootContext)();
  const thumbRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const defaultInputId = (0, _useBaseUiId.useBaseUiId)();
  const labelableId = (0, _useLabelableId.useLabelableId)();
  const inputId = range ? defaultInputId : labelableId;
  const thumbMetadata = React.useMemo(() => ({
    inputId
  }), [inputId]);
  const {
    ref: listItemRef,
    index: compositeIndex
  } = (0, _useCompositeListItem.useCompositeListItem)({
    metadata: thumbMetadata
  });
  const index = !range ? 0 : indexProp ?? compositeIndex;
  const last = index === sliderValues.length - 1;
  const thumbValue = sliderValues[index];
  const thumbValuePercent = (0, _valueToPercent.valueToPercent)(thumbValue, min, max);
  const [isMounted, setIsMounted] = React.useState(false);
  const [positionPercent, setPositionPercent] = React.useState();
  (0, _useOnMount.useOnMount)(() => setIsMounted(true));
  const safeLastUsedThumbIndex = lastUsedThumbIndex >= 0 && lastUsedThumbIndex < sliderValues.length ? lastUsedThumbIndex : -1;
  const getInsetPosition = (0, _useStableCallback.useStableCallback)(() => {
    const control = controlRef.current;
    const thumb = thumbRef.current;
    if (!control || !thumb) {
      return;
    }
    const thumbRect = thumb.getBoundingClientRect();
    const controlRect = control.getBoundingClientRect();
    const side = vertical ? 'height' : 'width';
    // the total travel distance adjusted to account for the thumb size
    const controlSize = controlRect[side] - thumbRect[side];
    // px distance from the starting edge (inline-start or bottom) to the thumb center
    const thumbOffsetFromControlEdge = thumbRect[side] / 2 + controlSize * thumbValuePercent / 100;
    const nextPositionPercent = thumbOffsetFromControlEdge / controlRect[side] * 100;
    setPositionPercent(nextPositionPercent);
    if (index === 0) {
      setIndicatorPosition(prevPosition => [nextPositionPercent, prevPosition[1]]);
    } else if (last) {
      setIndicatorPosition(prevPosition => [prevPosition[0], nextPositionPercent]);
    }
  });
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (inset) {
      queueMicrotask(getInsetPosition);
    }
  }, [getInsetPosition, inset]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (inset) {
      getInsetPosition();
    }
  }, [getInsetPosition, inset, thumbValuePercent]);
  const getThumbStyle = React.useCallback(() => {
    const startEdge = vertical ? 'bottom' : 'insetInlineStart';
    const crossOffsetProperty = vertical ? 'left' : 'top';
    let zIndex;
    if (range) {
      if (activeIndex === index) {
        zIndex = 2;
      } else if (safeLastUsedThumbIndex === index) {
        zIndex = 1;
      }
    } else if (activeIndex === index) {
      zIndex = 1;
    }
    if (!inset) {
      if (!Number.isFinite(thumbValuePercent)) {
        return _visuallyHidden.visuallyHidden;
      }
      return {
        position: 'absolute',
        [startEdge]: `${thumbValuePercent}%`,
        [crossOffsetProperty]: '50%',
        translate: `${(vertical || !rtl ? -1 : 1) * 50}% ${(vertical ? 1 : -1) * 50}%`,
        zIndex
      };
    }
    return {
      ['--position']: `${positionPercent}%`,
      visibility: renderBeforeHydration && !isMounted || positionPercent === undefined ? 'hidden' : undefined,
      position: 'absolute',
      [startEdge]: 'var(--position)',
      [crossOffsetProperty]: '50%',
      translate: `${(vertical || !rtl ? -1 : 1) * 50}% ${(vertical ? 1 : -1) * 50}%`,
      zIndex
    };
  }, [activeIndex, index, inset, isMounted, positionPercent, range, renderBeforeHydration, rtl, safeLastUsedThumbIndex, thumbValuePercent, vertical]);
  let cssWritingMode;
  if (orientation === 'vertical') {
    cssWritingMode = rtl ? 'vertical-rl' : 'vertical-lr';
  }
  const ariaLabel = typeof getAriaLabelProp === 'function' ? getAriaLabelProp(index) : ariaLabelProp;
  const inputProps = (0, _mergeProps.mergeProps)({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledByProp ?? (ariaLabel == null ? labelId : undefined),
    'aria-describedby': ariaDescribedByProp,
    'aria-orientation': orientation,
    'aria-valuenow': thumbValue,
    'aria-valuetext': typeof getAriaValueTextProp === 'function' ? getAriaValueTextProp((0, _formatNumber.formatNumber)(thumbValue, locale, formatOptionsRef.current ?? undefined), thumbValue, index) : getDefaultAriaValueText(sliderValues, index, formatOptionsRef.current ?? undefined, locale),
    disabled,
    id: inputId,
    max,
    min,
    name,
    onChange(event) {
      handleInputChange(event.target.valueAsNumber, index, event);
    },
    onFocus() {
      setActive(index);
      setFocused(true);
    },
    onBlur() {
      if (!thumbRef.current) {
        return;
      }
      setActive(-1);
      setTouched(true);
      setFocused(false);
      if (validationMode === 'onBlur') {
        validation.commit((0, _getSliderValue.getSliderValue)(thumbValue, index, min, max, range, sliderValues));
      }
    },
    onKeyDown(event) {
      if (!ALL_KEYS.has(event.key)) {
        return;
      }
      if (_composite.COMPOSITE_KEYS.has(event.key)) {
        event.stopPropagation();
      }
      let newValue = null;
      const roundedValue = (0, _roundValueToStep.roundValueToStep)(thumbValue, step, min);
      switch (event.key) {
        case _composite.ARROW_UP:
          newValue = getNewValue(roundedValue, event.shiftKey ? largeStep : step, 1, min, max);
          break;
        case _composite.ARROW_RIGHT:
          newValue = getNewValue(roundedValue, event.shiftKey ? largeStep : step, rtl ? -1 : 1, min, max);
          break;
        case _composite.ARROW_DOWN:
          newValue = getNewValue(roundedValue, event.shiftKey ? largeStep : step, -1, min, max);
          break;
        case _composite.ARROW_LEFT:
          newValue = getNewValue(roundedValue, event.shiftKey ? largeStep : step, rtl ? 1 : -1, min, max);
          break;
        case PAGE_UP:
          newValue = getNewValue(roundedValue, largeStep, 1, min, max);
          break;
        case PAGE_DOWN:
          newValue = getNewValue(roundedValue, largeStep, -1, min, max);
          break;
        case _composite.END:
          newValue = max;
          if (range) {
            newValue = Number.isFinite(sliderValues[index + 1]) ? sliderValues[index + 1] - step * minStepsBetweenValues : max;
          }
          break;
        case _composite.HOME:
          newValue = min;
          if (range) {
            newValue = Number.isFinite(sliderValues[index - 1]) ? sliderValues[index - 1] + step * minStepsBetweenValues : min;
          }
          break;
        default:
          break;
      }
      if (newValue !== null) {
        handleInputChange(newValue, index, event);
        event.preventDefault();
      }
    },
    step,
    style: {
      ..._visuallyHidden.visuallyHidden,
      // So that VoiceOver's focus indicator matches the thumb's dimensions
      width: '100%',
      height: '100%',
      writingMode: cssWritingMode
    },
    tabIndex: tabIndexProp ?? undefined,
    type: 'range',
    value: thumbValue ?? ''
  }, validation.getInputValidationProps);
  const mergedInputRef = (0, _useMergedRefs.useMergedRefs)(inputRef, validation.inputRef, inputRefProp);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    ref: [forwardedRef, listItemRef, thumbRef],
    props: [{
      [_SliderThumbDataAttributes.SliderThumbDataAttributes.index]: index,
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
        children: [childrenProp, /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
          ref: mergedInputRef,
          ...inputProps
        }), inset && !isMounted && renderBeforeHydration &&
        // this must be rendered with the last thumb to ensure all
        // preceding thumbs are already rendered in the DOM
        last && /*#__PURE__*/(0, _jsxRuntime.jsx)("script", {
          nonce: nonce
          // eslint-disable-next-line react/no-danger
          ,
          dangerouslySetInnerHTML: {
            __html: _prehydrationScript.script
          },
          suppressHydrationWarning: true
        })]
      }),
      id,
      onBlur: onBlurProp,
      onFocus: onFocusProp,
      onPointerDown(event) {
        pressedThumbIndexRef.current = index;
        if (thumbRef.current != null) {
          const axis = orientation === 'horizontal' ? 'x' : 'y';
          const midpoint = (0, _getMidpoint.getMidpoint)(thumbRef.current);
          const offset = (orientation === 'horizontal' ? event.clientX : event.clientY) - midpoint[axis];
          pressedThumbCenterOffsetRef.current = offset;
        }
        if (inputRef.current != null && pressedInputRef.current !== inputRef.current) {
          pressedInputRef.current = inputRef.current;
        }
      },
      style: getThumbStyle(),
      suppressHydrationWarning: renderBeforeHydration || undefined,
      tabIndex: -1
    }, elementProps],
    stateAttributesMapping: _stateAttributesMapping.sliderStateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") SliderThumb.displayName = "SliderThumb";