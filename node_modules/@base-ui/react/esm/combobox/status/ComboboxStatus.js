'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * Displays a status message whose content changes are announced politely to screen readers.
 * Useful for conveying the status of an asynchronously loaded list.
 * Renders a `<div>` element.
 */
export const ComboboxStatus = /*#__PURE__*/React.forwardRef(function ComboboxStatus(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  return useRenderElement('div', componentProps, {
    ref: forwardedRef,
    props: [{
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true
    }, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") ComboboxStatus.displayName = "ComboboxStatus";