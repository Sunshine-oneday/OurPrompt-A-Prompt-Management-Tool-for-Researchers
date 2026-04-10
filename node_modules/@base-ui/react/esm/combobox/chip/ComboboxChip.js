'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useStore } from '@base-ui/utils/store';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useComboboxChipsContext } from "../chips/ComboboxChipsContext.js";
import { useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { useCompositeListItem } from "../../composite/list/useCompositeListItem.js";
import { ComboboxChipContext } from "./ComboboxChipContext.js";
import { stopEvent } from "../../floating-ui-react/utils.js";
import { selectors } from "../store.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";

/**
 * An individual chip that represents a value in a multiselectable input.
 * Renders a `<div>` element.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ComboboxChip = /*#__PURE__*/React.forwardRef(function ComboboxChip(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const store = useComboboxRootContext();
  const {
    setHighlightedChipIndex,
    chipsRef
  } = useComboboxChipsContext();
  const disabled = useStore(store, selectors.disabled);
  const readOnly = useStore(store, selectors.readOnly);
  const selectedValue = useStore(store, selectors.selectedValue);
  const {
    ref,
    index
  } = useCompositeListItem();
  function handleKeyDown(event) {
    let nextIndex = index;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) {
        nextIndex = index - 1;
      } else {
        nextIndex = undefined;
      }
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (index < selectedValue.length - 1) {
        nextIndex = index + 1;
      } else {
        nextIndex = undefined;
      }
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      const computedNextIndex = index >= selectedValue.length - 1 ? selectedValue.length - 2 : index;
      nextIndex = computedNextIndex >= 0 ? computedNextIndex : undefined;
      stopEvent(event);
      store.state.setIndices({
        activeIndex: null,
        selectedIndex: null,
        type: 'keyboard'
      });
      store.state.setSelectedValue(selectedValue.filter((_, i) => i !== index), createChangeEventDetails(REASONS.none, event.nativeEvent));
    } else if (event.key === 'Enter' || event.key === ' ') {
      stopEvent(event);
      nextIndex = undefined;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      stopEvent(event);
      store.state.setOpen(true, createChangeEventDetails(REASONS.listNavigation, event.nativeEvent));
      nextIndex = undefined;
    } else if (
    // Check for printable characters (letters, numbers, symbols)
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      nextIndex = undefined;
    }
    return nextIndex;
  }
  const state = {
    disabled
  };
  const element = useRenderElement('div', componentProps, {
    ref: [forwardedRef, ref],
    state,
    props: [{
      tabIndex: -1,
      'aria-disabled': disabled || undefined,
      'aria-readonly': readOnly || undefined,
      onKeyDown(event) {
        if (disabled || readOnly) {
          return;
        }
        const nextIndex = handleKeyDown(event);
        ReactDOM.flushSync(() => {
          setHighlightedChipIndex(nextIndex);
        });
        if (nextIndex === undefined) {
          store.state.inputRef.current?.focus();
        } else {
          chipsRef.current[nextIndex]?.focus();
        }
      },
      onMouseDown(event) {
        if (readOnly) {
          return;
        }
        event.preventDefault();
        if (disabled) {
          return;
        }
        store.state.inputRef.current?.focus();
      }
    }, elementProps]
  });
  const contextValue = React.useMemo(() => ({
    index
  }), [index]);
  return /*#__PURE__*/_jsx(ComboboxChipContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ComboboxChip.displayName = "ComboboxChip";