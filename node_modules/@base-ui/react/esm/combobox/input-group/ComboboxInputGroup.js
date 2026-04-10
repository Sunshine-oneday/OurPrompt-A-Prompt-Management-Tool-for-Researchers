'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useStore } from '@base-ui/utils/store';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { useComboboxDerivedItemsContext, useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { selectors } from "../store.js";
import { triggerStateAttributesMapping } from "../utils/stateAttributesMapping.js";

/**
 * A wrapper for the input and its associated controls.
 * Renders a `<div>` element.
 */
export const ComboboxInputGroup = /*#__PURE__*/React.forwardRef(function ComboboxInputGroup(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    state: fieldState,
    disabled: fieldDisabled
  } = useFieldRootContext();
  const store = useComboboxRootContext();
  const {
    filteredItems
  } = useComboboxDerivedItemsContext();
  const open = useStore(store, selectors.open);
  const mounted = useStore(store, selectors.mounted);
  const popupSideValue = useStore(store, selectors.popupSide);
  const positionerElement = useStore(store, selectors.positionerElement);
  const comboboxDisabled = useStore(store, selectors.disabled);
  const readOnly = useStore(store, selectors.readOnly);
  const hasSelectedValue = useStore(store, selectors.hasSelectedValue);
  const selectionMode = useStore(store, selectors.selectionMode);
  const popupSide = mounted && positionerElement ? popupSideValue : null;
  const disabled = fieldDisabled || comboboxDisabled;
  const listEmpty = filteredItems.length === 0;
  const placeholder = selectionMode === 'none' ? false : !hasSelectedValue;
  const state = {
    ...fieldState,
    open,
    disabled,
    readOnly,
    popupSide,
    listEmpty,
    placeholder
  };
  const setInputGroupElement = useStableCallback(element => {
    store.set('inputGroupElement', element);
  });
  return useRenderElement('div', componentProps, {
    ref: [forwardedRef, setInputGroupElement],
    props: [{
      role: 'group'
    }, elementProps],
    state,
    stateAttributesMapping: triggerStateAttributesMapping
  });
});
if (process.env.NODE_ENV !== "production") ComboboxInputGroup.displayName = "ComboboxInputGroup";