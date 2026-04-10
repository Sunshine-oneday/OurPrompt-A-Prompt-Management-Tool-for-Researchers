'use client';

import * as React from 'react';
import { formatNumber } from "../../utils/formatNumber.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useSliderRootContext } from "../root/SliderRootContext.js";
import { sliderStateAttributesMapping } from "../root/stateAttributesMapping.js";
/**
 * Displays the current value of the slider as text.
 * Renders an `<output>` element.
 *
 * Documentation: [Base UI Slider](https://base-ui.com/react/components/slider)
 */
export const SliderValue = /*#__PURE__*/React.forwardRef(function SliderValue(componentProps, forwardedRef) {
  const {
    'aria-live': ariaLive = 'off',
    render,
    className,
    children,
    ...elementProps
  } = componentProps;
  const {
    thumbMap,
    state,
    values,
    formatOptionsRef,
    locale
  } = useSliderRootContext();
  const outputFor = React.useMemo(() => {
    let htmlFor = '';
    for (const thumbMetadata of thumbMap.values()) {
      if (thumbMetadata?.inputId) {
        htmlFor += `${thumbMetadata.inputId} `;
      }
    }
    return htmlFor.trim() === '' ? undefined : htmlFor.trim();
  }, [thumbMap]);
  const formattedValues = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < values.length; i += 1) {
      arr.push(formatNumber(values[i], locale, formatOptionsRef.current ?? undefined));
    }
    return arr;
  }, [formatOptionsRef, locale, values]);
  const defaultDisplayValue = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < values.length; i += 1) {
      arr.push(formattedValues[i] || values[i]);
    }
    return arr.join(' – ');
  }, [values, formattedValues]);
  const element = useRenderElement('output', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      // off by default because it will keep announcing when the slider is being dragged
      // and also when the value is changing (but not yet committed)
      'aria-live': ariaLive,
      children: typeof children === 'function' ? children(formattedValues, values) : defaultDisplayValue,
      htmlFor: outputFor
    }, elementProps],
    stateAttributesMapping: sliderStateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") SliderValue.displayName = "SliderValue";