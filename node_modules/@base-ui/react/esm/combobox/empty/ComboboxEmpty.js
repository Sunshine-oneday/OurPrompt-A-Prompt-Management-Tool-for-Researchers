'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useComboboxDerivedItemsContext, useComboboxRootContext } from "../root/ComboboxRootContext.js";

/**
 * Renders its children only when the list is empty.
 * Requires the `items` prop on the root component.
 * Announces changes politely to screen readers.
 * Renders a `<div>` element.
 */
export const ComboboxEmpty = /*#__PURE__*/React.forwardRef(function ComboboxEmpty(componentProps, forwardedRef) {
  const {
    render,
    className,
    children: childrenProp,
    ...elementProps
  } = componentProps;
  const {
    filteredItems
  } = useComboboxDerivedItemsContext();
  const store = useComboboxRootContext();
  const children = filteredItems.length === 0 ? childrenProp : null;
  return useRenderElement('div', componentProps, {
    ref: [forwardedRef, store.state.emptyRef],
    props: [{
      children,
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true
    }, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") ComboboxEmpty.displayName = "ComboboxEmpty";