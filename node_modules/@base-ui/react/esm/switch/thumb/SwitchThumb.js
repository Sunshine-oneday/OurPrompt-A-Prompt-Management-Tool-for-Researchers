'use client';

import * as React from 'react';
import { useSwitchRootContext } from "../root/SwitchRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { stateAttributesMapping } from "../stateAttributesMapping.js";

/**
 * The movable part of the switch that indicates whether the switch is on or off.
 * Renders a `<span>`.
 *
 * Documentation: [Base UI Switch](https://base-ui.com/react/components/switch)
 */
export const SwitchThumb = /*#__PURE__*/React.forwardRef(function SwitchThumb(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    state: fieldState
  } = useFieldRootContext();
  const state = useSwitchRootContext();
  const extendedState = {
    ...fieldState,
    ...state
  };
  return useRenderElement('span', componentProps, {
    state: extendedState,
    ref: forwardedRef,
    stateAttributesMapping,
    props: elementProps
  });
});
if (process.env.NODE_ENV !== "production") SwitchThumb.displayName = "SwitchThumb";