'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * An icon that indicates that the trigger button opens the popup.
 * Renders a `<span>` element.
 */
export const ComboboxIcon = /*#__PURE__*/React.forwardRef(function ComboboxIcon(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const element = useRenderElement('span', componentProps, {
    ref: forwardedRef,
    props: [{
      'aria-hidden': true,
      children: '▼'
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") ComboboxIcon.displayName = "ComboboxIcon";