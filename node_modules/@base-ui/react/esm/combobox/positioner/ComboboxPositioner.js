'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { inertValue } from '@base-ui/utils/inertValue';
import { useScrollLock } from '@base-ui/utils/useScrollLock';
import { useComboboxFloatingContext, useComboboxRootContext, useComboboxDerivedItemsContext } from "../root/ComboboxRootContext.js";
import { ComboboxPositionerContext } from "./ComboboxPositionerContext.js";
import { useAnchorPositioning } from "../../utils/useAnchorPositioning.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";
import { useComboboxPortalContext } from "../portal/ComboboxPortalContext.js";
import { DROPDOWN_COLLISION_AVOIDANCE } from "../../utils/constants.js";
import { getDisabledMountTransitionStyles } from "../../utils/getDisabledMountTransitionStyles.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { selectors } from "../store.js";
import { InternalBackdrop } from "../../utils/InternalBackdrop.js";

/**
 * Positions the popup against the trigger.
 * Renders a `<div>` element.
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ComboboxPositioner = /*#__PURE__*/React.forwardRef(function ComboboxPositioner(componentProps, forwardedRef) {
  const {
    render,
    className,
    anchor,
    positionMethod = 'absolute',
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding = 5,
    arrowPadding = 5,
    sticky = false,
    disableAnchorTracking = false,
    collisionAvoidance = DROPDOWN_COLLISION_AVOIDANCE,
    ...elementProps
  } = componentProps;
  const store = useComboboxRootContext();
  const {
    filteredItems
  } = useComboboxDerivedItemsContext();
  const floatingRootContext = useComboboxFloatingContext();
  const keepMounted = useComboboxPortalContext();
  const modal = useStore(store, selectors.modal);
  const open = useStore(store, selectors.open);
  const mounted = useStore(store, selectors.mounted);
  const openMethod = useStore(store, selectors.openMethod);
  const triggerElement = useStore(store, selectors.triggerElement);
  const inputElement = useStore(store, selectors.inputElement);
  const inputGroupElement = useStore(store, selectors.inputGroupElement);
  const inputInsidePopup = useStore(store, selectors.inputInsidePopup);
  const transitionStatus = useStore(store, selectors.transitionStatus);
  const empty = filteredItems.length === 0;
  const resolvedAnchor = anchor ?? (inputInsidePopup ? triggerElement : inputGroupElement ?? inputElement);
  const positioning = useAnchorPositioning({
    anchor: resolvedAnchor,
    floatingRootContext,
    positionMethod,
    mounted,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    collisionBoundary,
    collisionPadding,
    sticky,
    disableAnchorTracking,
    keepMounted,
    collisionAvoidance,
    lazyFlip: true
  });
  useScrollLock(open && modal && openMethod !== 'touch', triggerElement);
  const defaultProps = React.useMemo(() => {
    const style = {
      ...positioning.positionerStyles
    };
    if (!open) {
      style.pointerEvents = 'none';
    }
    return {
      role: 'presentation',
      hidden: !mounted,
      style
    };
  }, [open, mounted, positioning.positionerStyles]);
  const state = {
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    empty
  };
  useIsoLayoutEffect(() => {
    store.set('popupSide', positioning.side);
  }, [store, positioning.side]);
  const contextValue = React.useMemo(() => ({
    side: positioning.side,
    align: positioning.align,
    arrowRef: positioning.arrowRef,
    arrowUncentered: positioning.arrowUncentered,
    arrowStyles: positioning.arrowStyles,
    anchorHidden: positioning.anchorHidden,
    isPositioned: positioning.isPositioned
  }), [positioning.side, positioning.align, positioning.arrowRef, positioning.arrowUncentered, positioning.arrowStyles, positioning.anchorHidden, positioning.isPositioned]);
  const setPositionerElement = useStableCallback(element => {
    store.set('positionerElement', element);
  });
  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, setPositionerElement],
    props: [defaultProps, getDisabledMountTransitionStyles(transitionStatus), elementProps],
    stateAttributesMapping: popupStateMapping
  });
  return /*#__PURE__*/_jsxs(ComboboxPositionerContext.Provider, {
    value: contextValue,
    children: [mounted && modal && /*#__PURE__*/_jsx(InternalBackdrop, {
      inert: inertValue(!open),
      cutout: inputGroupElement ?? inputElement ?? triggerElement
    }), element]
  });
});
if (process.env.NODE_ENV !== "production") ComboboxPositioner.displayName = "ComboboxPositioner";