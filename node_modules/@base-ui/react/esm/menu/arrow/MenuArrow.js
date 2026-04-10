'use client';

import * as React from 'react';
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext.js";
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";

/**
 * Displays an element positioned against the menu anchor.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuArrow = /*#__PURE__*/React.forwardRef(function MenuArrow(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useMenuRootContext();
  const {
    arrowRef,
    side,
    align,
    arrowUncentered,
    arrowStyles
  } = useMenuPositionerContext();
  const open = store.useState('open');
  const state = {
    open,
    side,
    align,
    uncentered: arrowUncentered
  };
  return useRenderElement('div', componentProps, {
    ref: [arrowRef, forwardedRef],
    stateAttributesMapping: popupStateMapping,
    state,
    props: {
      style: arrowStyles,
      'aria-hidden': true,
      ...elementProps
    }
  });
});
if (process.env.NODE_ENV !== "production") MenuArrow.displayName = "MenuArrow";