'use client';

import * as React from 'react';
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { usePopupViewport } from "../../utils/usePopupViewport.js";
import { MenuViewportCssVars } from "./MenuViewportCssVars.js";
const stateAttributesMapping = {
  activationDirection: value => value ? {
    'data-activation-direction': value
  } : null
};

/**
 * A viewport for displaying content transitions.
 * This component is only required if one popup can be opened by multiple triggers, its content change based on the trigger
 * and switching between them is animated.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuViewport = /*#__PURE__*/React.forwardRef(function MenuViewport(componentProps, forwardedRef) {
  const {
    render,
    className,
    children,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useMenuRootContext();
  const {
    side
  } = useMenuPositionerContext();
  const instantType = store.useState('instantType');
  const {
    children: childrenToRender,
    state: viewportState
  } = usePopupViewport({
    store,
    side,
    cssVars: MenuViewportCssVars,
    children
  });
  const state = {
    activationDirection: viewportState.activationDirection,
    transitioning: viewportState.transitioning,
    instant: instantType
  };
  return useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [elementProps, {
      children: childrenToRender
    }],
    stateAttributesMapping
  });
});
if (process.env.NODE_ENV !== "production") MenuViewport.displayName = "MenuViewport";