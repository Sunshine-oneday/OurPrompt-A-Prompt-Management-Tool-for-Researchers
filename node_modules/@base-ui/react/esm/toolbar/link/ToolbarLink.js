'use client';

import * as React from 'react';
import { useToolbarRootContext } from "../root/ToolbarRootContext.js";
import { CompositeItem } from "../../composite/item/CompositeItem.js";
import { jsx as _jsx } from "react/jsx-runtime";
const TOOLBAR_LINK_METADATA = {
  // links cannot be disabled, this metadata is only used for deriving `disabledIndices``
  // TODO: better name
  focusableWhenDisabled: true
};

/**
 * A link component.
 * Renders an `<a>` element.
 *
 * Documentation: [Base UI Toolbar](https://base-ui.com/react/components/toolbar)
 */
export const ToolbarLink = /*#__PURE__*/React.forwardRef(function ToolbarLink(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const {
    orientation
  } = useToolbarRootContext();
  const state = {
    orientation
  };
  return /*#__PURE__*/_jsx(CompositeItem, {
    tag: "a",
    render: render,
    className: className,
    metadata: TOOLBAR_LINK_METADATA,
    state: state,
    refs: [forwardedRef],
    props: [elementProps]
  });
});
if (process.env.NODE_ENV !== "production") ToolbarLink.displayName = "ToolbarLink";