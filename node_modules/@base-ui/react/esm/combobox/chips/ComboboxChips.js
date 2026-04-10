'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { ComboboxChipsContext } from "./ComboboxChipsContext.js";
import { CompositeList } from "../../composite/list/CompositeList.js";
import { useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { selectors } from "../store.js";
import { EMPTY_OBJECT } from "../../utils/constants.js";

/**
 * A container for the chips in a multiselectable input.
 * Renders a `<div>` element.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ComboboxChips = /*#__PURE__*/React.forwardRef(function ComboboxChips(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const store = useComboboxRootContext();
  const open = useStore(store, selectors.open);
  const hasSelectionChips = useStore(store, selectors.hasSelectionChips);
  const [highlightedChipIndex, setHighlightedChipIndex] = React.useState(undefined);
  if (open && highlightedChipIndex !== undefined) {
    setHighlightedChipIndex(undefined);
  }
  const chipsRef = React.useRef([]);
  const element = useRenderElement('div', componentProps, {
    ref: [forwardedRef, store.state.chipsContainerRef],
    // NVDA enters browse mode instead of staying in focus mode when navigating with
    // arrow keys inside a container unless it has a toolbar role.
    props: [hasSelectionChips ? {
      role: 'toolbar'
    } : EMPTY_OBJECT, elementProps]
  });
  const contextValue = React.useMemo(() => ({
    highlightedChipIndex,
    setHighlightedChipIndex,
    chipsRef
  }), [highlightedChipIndex, setHighlightedChipIndex, chipsRef]);
  return /*#__PURE__*/_jsx(ComboboxChipsContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(CompositeList, {
      elementsRef: chipsRef,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") ComboboxChips.displayName = "ComboboxChips";