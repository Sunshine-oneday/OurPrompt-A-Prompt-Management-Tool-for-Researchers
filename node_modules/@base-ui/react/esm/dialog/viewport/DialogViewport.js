'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useDialogRootContext } from "../root/DialogRootContext.js";
import { useDialogPortalContext } from "../portal/DialogPortalContext.js";
import { DialogViewportDataAttributes } from "./DialogViewportDataAttributes.js";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping,
  nested(value) {
    return value ? {
      [DialogViewportDataAttributes.nested]: ''
    } : null;
  },
  nestedDialogOpen(value) {
    return value ? {
      [DialogViewportDataAttributes.nestedDialogOpen]: ''
    } : null;
  }
};

/**
 * A positioning container for the dialog popup that can be made scrollable.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
 */
export const DialogViewport = /*#__PURE__*/React.forwardRef(function DialogViewport(componentProps, forwardedRef) {
  const {
    className,
    render,
    children,
    ...elementProps
  } = componentProps;
  const keepMounted = useDialogPortalContext();
  const {
    store
  } = useDialogRootContext();
  const open = store.useState('open');
  const nested = store.useState('nested');
  const transitionStatus = store.useState('transitionStatus');
  const nestedOpenDialogCount = store.useState('nestedOpenDialogCount');
  const mounted = store.useState('mounted');
  const nestedDialogOpen = nestedOpenDialogCount > 0;
  const state = {
    open,
    nested,
    transitionStatus,
    nestedDialogOpen
  };
  const shouldRender = keepMounted || mounted;
  return useRenderElement('div', componentProps, {
    enabled: shouldRender,
    state,
    ref: [forwardedRef, store.useStateSetter('viewportElement')],
    stateAttributesMapping,
    props: [{
      role: 'presentation',
      hidden: !mounted,
      style: {
        pointerEvents: !open ? 'none' : undefined
      },
      children
    }, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") DialogViewport.displayName = "DialogViewport";