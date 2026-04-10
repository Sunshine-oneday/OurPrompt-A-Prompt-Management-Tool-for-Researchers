'use client';

import * as React from 'react';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { visuallyHiddenInput } from '@base-ui/utils/visuallyHidden';
import { useButton } from "../../use-button/index.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @internal
 */
export const ComboboxInternalDismissButton = /*#__PURE__*/React.forwardRef(function ComboboxInternalDismissButton(_, forwardedRef) {
  const store = useComboboxRootContext();
  const {
    buttonRef,
    getButtonProps
  } = useButton({
    native: false
  });
  const mergedRef = useMergedRefs(forwardedRef, buttonRef);
  const handleDismiss = useStableCallback(event => {
    store.state.setOpen(false, createChangeEventDetails(REASONS.closePress, event.nativeEvent, event.currentTarget));
  });
  const dismissProps = getButtonProps({
    onClick: handleDismiss
  });
  return /*#__PURE__*/_jsx("span", {
    ref: mergedRef,
    ...dismissProps,
    "aria-label": "Dismiss",
    tabIndex: undefined,
    style: visuallyHiddenInput
  });
});
if (process.env.NODE_ENV !== "production") ComboboxInternalDismissButton.displayName = "ComboboxInternalDismissButton";