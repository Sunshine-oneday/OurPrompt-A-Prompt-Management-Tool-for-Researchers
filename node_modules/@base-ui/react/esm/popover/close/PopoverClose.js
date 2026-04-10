'use client';

import * as React from 'react';
import { usePopoverRootContext } from "../root/PopoverRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useButton } from "../../use-button/index.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useClosePartRegistration } from "../../utils/closePart.js";

/**
 * A button that closes the popover.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
export const PopoverClose = /*#__PURE__*/React.forwardRef(function PopoverClose(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    buttonRef,
    getButtonProps
  } = useButton({
    disabled,
    focusableWhenDisabled: false,
    native: nativeButton
  });
  const {
    store
  } = usePopoverRootContext();
  useClosePartRegistration();
  const element = useRenderElement('button', componentProps, {
    ref: [forwardedRef, buttonRef],
    props: [{
      onClick(event) {
        store.setOpen(false, createChangeEventDetails(REASONS.closePress, event.nativeEvent, event.currentTarget));
      }
    }, elementProps, getButtonProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") PopoverClose.displayName = "PopoverClose";