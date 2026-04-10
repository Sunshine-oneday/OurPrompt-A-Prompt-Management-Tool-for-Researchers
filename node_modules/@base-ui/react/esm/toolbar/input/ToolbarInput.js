'use client';

import * as React from 'react';
import { useFocusableWhenDisabled } from "../../utils/useFocusableWhenDisabled.js";
import { ARROW_LEFT, ARROW_RIGHT, stopEvent } from "../../composite/composite.js";
import { useToolbarRootContext } from "../root/ToolbarRootContext.js";
import { useToolbarGroupContext } from "../group/ToolbarGroupContext.js";
import { CompositeItem } from "../../composite/item/CompositeItem.js";

/**
 * A native input element that integrates with Toolbar keyboard navigation.
 * Renders an `<input>` element.
 *
 * Documentation: [Base UI Toolbar](https://base-ui.com/react/components/toolbar)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ToolbarInput = /*#__PURE__*/React.forwardRef(function ToolbarInput(componentProps, forwardedRef) {
  const {
    className,
    focusableWhenDisabled = true,
    render,
    disabled: disabledProp = false,
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
    props: focusableWhenDisabledProps
  } = useFocusableWhenDisabled({
    composite: true,
    disabled,
    focusableWhenDisabled,
    isNativeButton: false
  });
  const state = {
    disabled,
    orientation,
    focusable: focusableWhenDisabled
  };
  const defaultProps = {
    onClick(event) {
      if (disabled) {
        event.preventDefault();
      }
    },
    onKeyDown(event) {
      if (event.key !== ARROW_LEFT && event.key !== ARROW_RIGHT && disabled) {
        stopEvent(event);
      }
    },
    onPointerDown(event) {
      if (disabled) {
        event.preventDefault();
      }
    }
  };
  return /*#__PURE__*/_jsx(CompositeItem, {
    tag: "input",
    render: render,
    className: className,
    metadata: itemMetadata,
    state: state,
    refs: [forwardedRef],
    props: [defaultProps, elementProps, focusableWhenDisabledProps]
  });
});
if (process.env.NODE_ENV !== "production") ToolbarInput.displayName = "ToolbarInput";