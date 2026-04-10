'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { FloatingFocusManager } from "../../floating-ui-react/index.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useComboboxFloatingContext, useComboboxRootContext, useComboboxDerivedItemsContext } from "../root/ComboboxRootContext.js";
import { selectors } from "../store.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";
import { useComboboxPositionerContext } from "../positioner/ComboboxPositionerContext.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { contains, getTarget } from "../../floating-ui-react/utils.js";
import { getDisabledMountTransitionStyles } from "../../utils/getDisabledMountTransitionStyles.js";
import { ComboboxInternalDismissButton } from "../utils/ComboboxInternalDismissButton.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const stateAttributesMapping = {
  ...popupStateMapping,
  ...transitionStatusMapping
};

/**
 * A container for the list.
 * Renders a `<div>` element.
 */
export const ComboboxPopup = /*#__PURE__*/React.forwardRef(function ComboboxPopup(componentProps, forwardedRef) {
  const {
    render,
    className,
    initialFocus,
    finalFocus,
    ...elementProps
  } = componentProps;
  const store = useComboboxRootContext();
  const positioning = useComboboxPositionerContext();
  const floatingRootContext = useComboboxFloatingContext();
  const {
    filteredItems
  } = useComboboxDerivedItemsContext();
  const mounted = useStore(store, selectors.mounted);
  const open = useStore(store, selectors.open);
  const openMethod = useStore(store, selectors.openMethod);
  const transitionStatus = useStore(store, selectors.transitionStatus);
  const inputInsidePopup = useStore(store, selectors.inputInsidePopup);
  const inputElement = useStore(store, selectors.inputElement);
  const modal = useStore(store, selectors.modal);
  const empty = filteredItems.length === 0;
  useOpenChangeComplete({
    open,
    ref: store.state.popupRef,
    onComplete() {
      if (open) {
        store.state.onOpenChangeComplete(true);
      }
    }
  });
  const state = {
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    transitionStatus,
    empty
  };
  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, store.state.popupRef],
    props: [{
      role: inputInsidePopup ? 'dialog' : 'presentation',
      tabIndex: -1,
      onFocus(event) {
        const target = getTarget(event.nativeEvent);
        if (openMethod !== 'touch' && (contains(store.state.listElement, target) || target === event.currentTarget)) {
          store.state.inputRef.current?.focus();
        }
      }
    }, getDisabledMountTransitionStyles(transitionStatus), elementProps],
    stateAttributesMapping
  });

  // Default initial focus logic:
  // If opened by touch, focus the popup element to prevent the virtual keyboard from opening
  // (this is required for Android specifically as iOS handles this automatically).
  const computedDefaultInitialFocus = inputInsidePopup ? interactionType => interactionType === 'touch' ? store.state.popupRef.current : inputElement : false;
  const resolvedInitialFocus = initialFocus === undefined ? computedDefaultInitialFocus : initialFocus;
  let resolvedFinalFocus;
  if (finalFocus != null) {
    resolvedFinalFocus = finalFocus;
  } else {
    resolvedFinalFocus = inputInsidePopup ? undefined : false;
  }
  const focusManagerModal = !inputInsidePopup || modal;
  return /*#__PURE__*/_jsx(FloatingFocusManager, {
    context: floatingRootContext,
    disabled: !mounted,
    modal: focusManagerModal,
    openInteractionType: openMethod,
    initialFocus: resolvedInitialFocus,
    returnFocus: resolvedFinalFocus,
    getInsideElements: () => [store.state.startDismissRef.current, store.state.endDismissRef.current],
    children: /*#__PURE__*/_jsxs(React.Fragment, {
      children: [element, focusManagerModal && /*#__PURE__*/_jsx(ComboboxInternalDismissButton, {
        ref: store.state.endDismissRef
      })]
    })
  });
});
if (process.env.NODE_ENV !== "production") ComboboxPopup.displayName = "ComboboxPopup";