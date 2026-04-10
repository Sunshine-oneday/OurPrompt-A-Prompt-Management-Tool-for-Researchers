'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useNavigationMenuRootContext } from "../root/NavigationMenuRootContext.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useNavigationMenuPositionerContext } from "../positioner/NavigationMenuPositionerContext.js";
import { useDirection } from "../../direction-provider/DirectionContext.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};

/**
 * A container for the navigation menu contents.
 * Renders a `<nav>` element.
 *
 * Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
 */
export const NavigationMenuPopup = /*#__PURE__*/React.forwardRef(function NavigationMenuPopup(componentProps, forwardedRef) {
  const {
    className,
    render,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    open,
    transitionStatus,
    setPopupElement
  } = useNavigationMenuRootContext();
  const positioning = useNavigationMenuPositionerContext();
  const direction = useDirection();
  const id = useBaseUiId(idProp);
  const state = {
    open,
    transitionStatus,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden
  };

  // Ensure popup size transitions correctly when anchored to `bottom` (side=top) or `right` (side=left).
  let isOriginSide = positioning.side === 'top';
  let isPhysicalLeft = positioning.side === 'left';
  if (direction === 'rtl') {
    isOriginSide = isOriginSide || positioning.side === 'inline-end';
    isPhysicalLeft = isPhysicalLeft || positioning.side === 'inline-end';
  } else {
    isOriginSide = isOriginSide || positioning.side === 'inline-start';
    isPhysicalLeft = isPhysicalLeft || positioning.side === 'inline-start';
  }
  const element = useRenderElement('nav', componentProps, {
    state,
    ref: [forwardedRef, setPopupElement],
    props: [{
      id,
      tabIndex: -1,
      style: isOriginSide ? {
        position: 'absolute',
        [positioning.side === 'top' ? 'bottom' : 'top']: '0',
        [isPhysicalLeft ? 'right' : 'left']: '0'
      } : {}
    }, elementProps],
    stateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") NavigationMenuPopup.displayName = "NavigationMenuPopup";