'use client';

import * as React from 'react';
import { useDialogRootContext } from "../../dialog/root/DialogRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { DrawerPopupCssVars } from "../popup/DrawerPopupCssVars.js";
import { DrawerBackdropCssVars } from "./DrawerBackdropCssVars.js";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};

/**
 * An overlay displayed beneath the popup.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
 */
export const DrawerBackdrop = /*#__PURE__*/React.forwardRef(function DrawerBackdrop(componentProps, forwardedRef) {
  const {
    render,
    className,
    forceRender = false,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useDialogRootContext();
  const open = store.useState('open');
  const nested = store.useState('nested');
  const mounted = store.useState('mounted');
  const transitionStatus = store.useState('transitionStatus');
  const state = {
    open,
    transitionStatus
  };
  return useRenderElement('div', componentProps, {
    state,
    ref: [store.context.backdropRef, forwardedRef],
    stateAttributesMapping,
    props: [{
      role: 'presentation',
      hidden: !mounted,
      style: {
        pointerEvents: !open ? 'none' : undefined,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        [DrawerBackdropCssVars.swipeProgress]: '0',
        [DrawerPopupCssVars.swipeStrength]: '1'
      }
    }, elementProps],
    enabled: forceRender || !nested
  });
});
if (process.env.NODE_ENV !== "production") DrawerBackdrop.displayName = "DrawerBackdrop";