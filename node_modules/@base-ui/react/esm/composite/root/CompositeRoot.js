'use client';

import * as React from 'react';
import { CompositeList } from "../list/CompositeList.js";
import { useCompositeRoot } from "./useCompositeRoot.js";
import { CompositeRootContext } from "./CompositeRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useDirection } from "../../direction-provider/DirectionContext.js";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../utils/constants.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @internal
 */
export function CompositeRoot(componentProps) {
  const {
    render,
    className,
    refs = EMPTY_ARRAY,
    props = EMPTY_ARRAY,
    state = EMPTY_OBJECT,
    stateAttributesMapping,
    highlightedIndex: highlightedIndexProp,
    onHighlightedIndexChange: onHighlightedIndexChangeProp,
    orientation,
    dense,
    itemSizes,
    loopFocus,
    cols,
    enableHomeAndEndKeys,
    onMapChange: onMapChangeProp,
    stopEventPropagation = true,
    rootRef,
    disabledIndices,
    modifierKeys,
    highlightItemOnHover = false,
    tag = 'div',
    ...elementProps
  } = componentProps;
  const direction = useDirection();
  const {
    props: defaultProps,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    onMapChange: onMapChangeUnwrapped,
    relayKeyboardEvent
  } = useCompositeRoot({
    itemSizes,
    cols,
    loopFocus,
    dense,
    orientation,
    highlightedIndex: highlightedIndexProp,
    onHighlightedIndexChange: onHighlightedIndexChangeProp,
    rootRef,
    stopEventPropagation,
    enableHomeAndEndKeys,
    direction,
    disabledIndices,
    modifierKeys
  });
  const element = useRenderElement(tag, componentProps, {
    state,
    ref: refs,
    props: [defaultProps, ...props, elementProps],
    stateAttributesMapping
  });
  const contextValue = React.useMemo(() => ({
    highlightedIndex,
    onHighlightedIndexChange,
    highlightItemOnHover,
    relayKeyboardEvent
  }), [highlightedIndex, onHighlightedIndexChange, highlightItemOnHover, relayKeyboardEvent]);
  return /*#__PURE__*/_jsx(CompositeRootContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(CompositeList, {
      elementsRef: elementsRef,
      onMapChange: newMap => {
        onMapChangeProp?.(newMap);
        onMapChangeUnwrapped(newMap);
      },
      children: element
    })
  });
}