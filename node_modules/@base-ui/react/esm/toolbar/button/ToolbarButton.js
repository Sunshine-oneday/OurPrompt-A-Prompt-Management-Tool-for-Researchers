'use client';

import * as React from 'react';
import { useButton } from "../../use-button/index.js";
import { useToolbarRootContext } from "../root/ToolbarRootContext.js";
import { useToolbarGroupContext } from "../group/ToolbarGroupContext.js";
import { CompositeItem } from "../../composite/item/CompositeItem.js";

/**
 * A button that can be used as-is or as a trigger for other components.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Toolbar](https://base-ui.com/react/components/toolbar)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ToolbarButton = /*#__PURE__*/React.forwardRef(function ToolbarButton(componentProps, forwardedRef) {
  const {
    className,
    disabled: disabledProp = false,
    focusableWhenDisabled = true,
    render,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const itemMetadata = React.useMemo(() => ({
    focusableWhenDisabled
  }), [focusableWhenDisabled]);
  const {
    disabled: toolbarDisabled,
    orientation
  } = useToolbarRootContext();
  const groupContext = useToolbarGroupContext(true);
  const disabled = toolbarDisabled || (groupContext?.disabled ?? false) || disabledProp;
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    focusableWhenDisabled,
    native: nativeButton
  });
  const state = {
    disabled,
    orientation,
    focusable: focusableWhenDisabled
  };
  return /*#__PURE__*/_jsx(CompositeItem, {
    tag: "button",
    render: render,
    className: className,
    metadata: itemMetadata,
    state: state,
    refs: [forwardedRef, buttonRef],
    props: [elementProps,
    // for integrating with Menu and Select disabled states, `disabled` is
    // intentionally duplicated even though getButtonProps includes it already
    // TODO: follow up after https://github.com/mui/base-ui/issues/1976#issuecomment-2916905663
    {
      disabled
    }, getButtonProps]
  });
});
if (process.env.NODE_ENV !== "production") ToolbarButton.displayName = "ToolbarButton";