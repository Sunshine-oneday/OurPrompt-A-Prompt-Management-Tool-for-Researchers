'use client';

import * as React from 'react';
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useContextMenuRootContext } from "../../context-menu/root/ContextMenuRootContext.js";
import { REASONS } from "../../utils/reasons.js";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};

/**
 * An overlay displayed beneath the menu popup.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuBackdrop = /*#__PURE__*/React.forwardRef(function MenuBackdrop(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useMenuRootContext();
  const open = store.useState('open');
  const mounted = store.useState('mounted');
  const transitionStatus = store.useState('transitionStatus');
  const lastOpenChangeReason = store.useState('lastOpenChangeReason');
  const contextMenuContext = useContextMenuRootContext();
  const state = {
    open,
    transitionStatus
  };
  return useRenderElement('div', componentProps, {
    ref: contextMenuContext?.backdropRef ? [forwardedRef, contextMenuContext.backdropRef] : forwardedRef,
    state,
    stateAttributesMapping,
    props: [{
      role: 'presentation',
      hidden: !mounted,
      style: {
        pointerEvents: lastOpenChangeReason === REASONS.triggerHover ? 'none' : undefined,
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }
    }, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") MenuBackdrop.displayName = "MenuBackdrop";