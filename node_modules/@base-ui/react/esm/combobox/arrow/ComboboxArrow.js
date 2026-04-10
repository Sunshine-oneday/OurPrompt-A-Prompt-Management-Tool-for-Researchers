'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useComboboxPositionerContext } from "../positioner/ComboboxPositionerContext.js";
import { useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { selectors } from "../store.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";

/**
 * Displays an element positioned against the anchor.
 * Renders a `<div>` element.
 */
export const ComboboxArrow = /*#__PURE__*/React.forwardRef(function ComboboxArrow(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const store = useComboboxRootContext();
  const {
    arrowRef,
    side,
    align,
    arrowUncentered,
    arrowStyles
  } = useComboboxPositionerContext();
  const open = useStore(store, selectors.open);
  const state = {
    open,
    side,
    align,
    uncentered: arrowUncentered
  };
  return useRenderElement('div', componentProps, {
    ref: [arrowRef, forwardedRef],
    stateAttributesMapping: popupStateMapping,
    state,
    props: {
      style: arrowStyles,
      'aria-hidden': true,
      ...elementProps
    }
  });
});
if (process.env.NODE_ENV !== "production") ComboboxArrow.displayName = "ComboboxArrow";