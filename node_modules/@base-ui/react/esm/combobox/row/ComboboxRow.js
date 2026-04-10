'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { ComboboxRowContext } from "./ComboboxRowContext.js";

/**
 * Displays a single row of items in a grid list.
 * Enable `grid` on the root component to turn the listbox into a grid.
 * Renders a `<div>` element.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ComboboxRow = /*#__PURE__*/React.forwardRef(function ComboboxRow(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const element = useRenderElement('div', componentProps, {
    ref: forwardedRef,
    props: [{
      role: 'row'
    }, elementProps]
  });
  return /*#__PURE__*/_jsx(ComboboxRowContext.Provider, {
    value: true,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ComboboxRow.displayName = "ComboboxRow";