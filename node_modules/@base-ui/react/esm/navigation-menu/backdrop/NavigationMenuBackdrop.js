'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useNavigationMenuRootContext } from "../root/NavigationMenuRootContext.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};

/**
 * A backdrop for the navigation menu popup.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
 */
export const NavigationMenuBackdrop = /*#__PURE__*/React.forwardRef(function NavigationMenuBackdrop(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const {
    open,
    mounted,
    transitionStatus
  } = useNavigationMenuRootContext();
  const state = {
    open,
    transitionStatus
  };
  const element = useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      role: 'presentation',
      hidden: !mounted,
      style: {
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }
    }, elementProps],
    stateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") NavigationMenuBackdrop.displayName = "NavigationMenuBackdrop";