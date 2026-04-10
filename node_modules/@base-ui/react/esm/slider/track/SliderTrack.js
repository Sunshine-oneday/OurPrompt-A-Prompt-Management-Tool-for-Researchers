'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useSliderRootContext } from "../root/SliderRootContext.js";
import { sliderStateAttributesMapping } from "../root/stateAttributesMapping.js";

/**
 * Contains the slider indicator and represents the entire range of the slider.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Slider](https://base-ui.com/react/components/slider)
 */
export const SliderTrack = /*#__PURE__*/React.forwardRef(function SliderTrack(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    state
  } = useSliderRootContext();
  const element = useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      style: {
        position: 'relative'
      }
    }, elementProps],
    stateAttributesMapping: sliderStateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") SliderTrack.displayName = "SliderTrack";