'use client';

import * as React from 'react';
import { useComboboxDerivedItemsContext } from "../root/ComboboxRootContext.js";
import { useGroupCollectionContext } from "./GroupCollectionContext.js";

/**
 * Renders filtered list items.
 * Doesn't render its own HTML element.
 *
 * If rendering a flat list, pass a function child to the `List` component instead, which implicitly wraps it.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export function ComboboxCollection(props) {
  const {
    children
  } = props;
  const {
    filteredItems
  } = useComboboxDerivedItemsContext();
  const groupContext = useGroupCollectionContext();
  const itemsToRender = groupContext ? groupContext.items : filteredItems;
  if (!itemsToRender) {
    return null;
  }
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: itemsToRender.map(children)
  });
}