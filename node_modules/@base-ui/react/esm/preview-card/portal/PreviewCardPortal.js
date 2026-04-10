'use client';

import * as React from 'react';
import { usePreviewCardRootContext } from "../root/PreviewCardContext.js";
import { PreviewCardPortalContext } from "./PreviewCardPortalContext.js";
import { FloatingPortalLite } from "../../utils/FloatingPortalLite.js";

/**
 * A portal element that moves the popup to a different part of the DOM.
 * By default, the portal element is appended to `<body>`.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Preview Card](https://base-ui.com/react/components/preview-card)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const PreviewCardPortal = /*#__PURE__*/React.forwardRef(function PreviewCardPortal(props, forwardedRef) {
  const {
    keepMounted = false,
    ...portalProps
  } = props;
  const store = usePreviewCardRootContext();
  const mounted = store.useState('mounted');
  const shouldRender = mounted || keepMounted;
  if (!shouldRender) {
    return null;
  }
  return /*#__PURE__*/_jsx(PreviewCardPortalContext.Provider, {
    value: keepMounted,
    children: /*#__PURE__*/_jsx(FloatingPortalLite, {
      ref: forwardedRef,
      ...portalProps
    })
  });
});
if (process.env.NODE_ENV !== "production") PreviewCardPortal.displayName = "PreviewCardPortal";