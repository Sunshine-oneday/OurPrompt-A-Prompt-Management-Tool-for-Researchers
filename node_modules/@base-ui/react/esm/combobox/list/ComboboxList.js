'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useComboboxDerivedItemsContext, useComboboxFloatingContext, useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { useComboboxPositionerContext } from "../positioner/ComboboxPositionerContext.js";
import { selectors } from "../store.js";
import { ComboboxCollection } from "../collection/ComboboxCollection.js";
import { CompositeList } from "../../composite/list/CompositeList.js";
import { stopEvent } from "../../floating-ui-react/utils.js";

/**
 * A list container for the items.
 * Renders a `<div>` element.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ComboboxList = /*#__PURE__*/React.forwardRef(function ComboboxList(componentProps, forwardedRef) {
  var _ComboboxCollection;
  const {
    render,
    className,
    children,
    ...elementProps
  } = componentProps;
  const store = useComboboxRootContext();
  const floatingRootContext = useComboboxFloatingContext();
  const hasPositionerContext = Boolean(useComboboxPositionerContext(true));
  const {
    filteredItems
  } = useComboboxDerivedItemsContext();
  const items = useStore(store, selectors.items);
  const labelsRef = useStore(store, selectors.labelsRef);
  const listRef = useStore(store, selectors.listRef);
  const selectionMode = useStore(store, selectors.selectionMode);
  const grid = useStore(store, selectors.grid);
  const popupProps = useStore(store, selectors.popupProps);
  const disabled = useStore(store, selectors.disabled);
  const readOnly = useStore(store, selectors.readOnly);
  const virtualized = useStore(store, selectors.virtualized);
  const multiple = selectionMode === 'multiple';
  const empty = filteredItems.length === 0;
  const setPositionerElement = useStableCallback(element => {
    store.set('positionerElement', element);
  });
  const setListElement = useStableCallback(element => {
    store.set('listElement', element);
  });

  // Support "closed template" API: if children is a function, implicitly wrap it
  // with a Combobox.Collection that reads items from context/root.
  // Ensures this component's `popupProps` subscription does not cause <Combobox.Item>
  // to re-render on every active index change.
  const resolvedChildren = React.useMemo(() => {
    if (typeof children === 'function') {
      return _ComboboxCollection || (_ComboboxCollection = /*#__PURE__*/_jsx(ComboboxCollection, {
        children: children
      }));
    }
    return children;
  }, [children]);
  const state = {
    empty
  };
  const floatingId = floatingRootContext.useState('floatingId');
  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, setListElement, hasPositionerContext ? null : setPositionerElement],
    props: [popupProps, {
      children: resolvedChildren,
      tabIndex: -1,
      id: floatingId,
      role: grid ? 'grid' : 'listbox',
      'aria-multiselectable': multiple ? 'true' : undefined,
      onKeyDown(event) {
        if (disabled || readOnly) {
          return;
        }
        if (event.key === 'Enter') {
          const activeIndex = store.state.activeIndex;
          if (activeIndex == null) {
            // Allow form submission when no item is highlighted.
            return;
          }
          stopEvent(event);
          const nativeEvent = event.nativeEvent;
          const listItem = store.state.listRef.current[activeIndex];
          if (listItem) {
            store.state.selectionEventRef.current = nativeEvent;
            listItem.click();
            store.state.selectionEventRef.current = null;
          }
        }
      },
      onKeyDownCapture() {
        store.state.keyboardActiveRef.current = true;
      },
      onPointerMoveCapture() {
        store.state.keyboardActiveRef.current = false;
      }
    }, elementProps]
  });
  if (virtualized) {
    return element;
  }
  return /*#__PURE__*/_jsx(CompositeList, {
    elementsRef: listRef,
    labelsRef: items ? undefined : labelsRef,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ComboboxList.displayName = "ComboboxList";