'use client';

import * as React from 'react';
import { useSelectRootContext } from "../root/SelectRootContext.js";
import { useSelectItemContext } from "../item/SelectItemContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * A text label of the select item.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
export const SelectItemText = /*#__PURE__*/React.memo(/*#__PURE__*/React.forwardRef(function SelectItemText(componentProps, forwardedRef) {
  const {
    indexRef,
    textRef,
    selectedByFocus,
    hasRegistered
  } = useSelectItemContext();
  const {
    selectedItemTextRef
  } = useSelectRootContext();
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const localRef = React.useCallback(node => {
    if (!node || !hasRegistered) {
      return;
    }
    const hasNoSelectedItemText = selectedItemTextRef.current === null || !selectedItemTextRef.current.isConnected;
    if (selectedByFocus || hasNoSelectedItemText && indexRef.current === 0) {
      selectedItemTextRef.current = node;
    }
  }, [selectedItemTextRef, indexRef, selectedByFocus, hasRegistered]);
  const element = useRenderElement('div', componentProps, {
    ref: [localRef, forwardedRef, textRef],
    props: elementProps
  });
  return element;
}));
if (process.env.NODE_ENV !== "production") SelectItemText.displayName = "SelectItemText";