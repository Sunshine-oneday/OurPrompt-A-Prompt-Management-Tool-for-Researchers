'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useComboboxInputValueContext, useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { selectors } from "../store.js";
import { useButton } from "../../use-button/index.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { useTransitionStatus } from "../../utils/useTransitionStatus.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { triggerOpenStateMapping } from "../../utils/popupStateMapping.js";
const stateAttributesMapping = {
  ...transitionStatusMapping,
  ...triggerOpenStateMapping
};

/**
 * Clears the value when clicked.
 * Renders a `<button>` element.
 */
export const ComboboxClear = /*#__PURE__*/React.forwardRef(function ComboboxClear(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp = false,
    nativeButton = true,
    keepMounted = false,
    ...elementProps
  } = componentProps;
  const {
    disabled: fieldDisabled
  } = useFieldRootContext();
  const store = useComboboxRootContext();
  const selectionMode = useStore(store, selectors.selectionMode);
  const comboboxDisabled = useStore(store, selectors.disabled);
  const readOnly = useStore(store, selectors.readOnly);
  const open = useStore(store, selectors.open);
  const selectedValue = useStore(store, selectors.selectedValue);
  const hasSelectionChips = useStore(store, selectors.hasSelectionChips);
  const inputValue = useComboboxInputValueContext();
  let visible = false;
  if (selectionMode === 'none') {
    visible = inputValue !== '';
  } else if (selectionMode === 'single') {
    visible = selectedValue != null;
  } else {
    visible = hasSelectionChips;
  }
  const disabled = fieldDisabled || comboboxDisabled || disabledProp;
  const {
    buttonRef,
    getButtonProps
  } = useButton({
    native: nativeButton,
    disabled
  });
  const {
    mounted,
    transitionStatus,
    setMounted
  } = useTransitionStatus(visible);
  const state = {
    disabled,
    open,
    transitionStatus
  };
  useOpenChangeComplete({
    open: visible,
    ref: store.state.clearRef,
    onComplete() {
      if (!visible) {
        setMounted(false);
      }
    }
  });
  const element = useRenderElement('button', componentProps, {
    state,
    ref: [forwardedRef, buttonRef, store.state.clearRef],
    props: [{
      tabIndex: -1,
      children: 'x',
      // Avoid stealing focus from the input.
      onMouseDown(event) {
        event.preventDefault();
      },
      onClick(event) {
        if (disabled || readOnly) {
          return;
        }
        const keyboardActiveRef = store.state.keyboardActiveRef;
        store.state.setInputValue('', createChangeEventDetails(REASONS.clearPress, event.nativeEvent));
        if (selectionMode !== 'none') {
          store.state.setSelectedValue(Array.isArray(selectedValue) ? [] : null, createChangeEventDetails(REASONS.clearPress, event.nativeEvent));
          store.state.setIndices({
            activeIndex: null,
            selectedIndex: null,
            type: keyboardActiveRef.current ? 'keyboard' : 'pointer'
          });
        } else {
          store.state.setIndices({
            activeIndex: null,
            type: keyboardActiveRef.current ? 'keyboard' : 'pointer'
          });
        }
        store.state.inputRef.current?.focus();
      }
    }, elementProps, getButtonProps],
    stateAttributesMapping
  });
  const shouldRender = keepMounted || mounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") ComboboxClear.displayName = "ComboboxClear";