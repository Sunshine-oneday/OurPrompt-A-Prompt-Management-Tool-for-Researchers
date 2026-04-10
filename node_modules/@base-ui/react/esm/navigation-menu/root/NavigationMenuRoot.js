'use client';

import * as React from 'react';
import { isHTMLElement } from '@floating-ui/utils/dom';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { ownerDocument } from '@base-ui/utils/owner';
import { FloatingNode, FloatingTree, useFloatingNodeId, useFloatingParentNodeId } from "../../floating-ui-react/index.js";
import { activeElement, contains } from "../../floating-ui-react/utils.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { NavigationMenuRootContext, NavigationMenuTreeContext, useNavigationMenuRootContext } from "./NavigationMenuRootContext.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { useTransitionStatus } from "../../utils/useTransitionStatus.js";
import { getCssDimensions } from "../../utils/getCssDimensions.js";
import { REASONS } from "../../utils/reasons.js";
import { NavigationMenuPopupCssVars } from "../popup/NavigationMenuPopupCssVars.js";
import { NavigationMenuPositionerCssVars } from "../positioner/NavigationMenuPositionerCssVars.js";
import { jsx as _jsx } from "react/jsx-runtime";
const blockedReturnFocusReasons = new Set([REASONS.triggerHover, REASONS.outsidePress, REASONS.focusOut]);
function setSharedFixedSize(popupElement, positionerElement) {
  const {
    width,
    height
  } = getCssDimensions(popupElement);
  if (width === 0 || height === 0) {
    return;
  }
  popupElement.style.setProperty(NavigationMenuPopupCssVars.popupWidth, `${width}px`);
  popupElement.style.setProperty(NavigationMenuPopupCssVars.popupHeight, `${height}px`);
  positionerElement.style.setProperty(NavigationMenuPositionerCssVars.positionerWidth, `${width}px`);
  positionerElement.style.setProperty(NavigationMenuPositionerCssVars.positionerHeight, `${height}px`);
}

/**
 * Groups all parts of the navigation menu.
 * Renders a `<nav>` element at the root, or `<div>` element when nested.
 *
 * Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
 */
export const NavigationMenuRoot = /*#__PURE__*/React.forwardRef(function NavigationMenuRoot(componentProps, forwardedRef) {
  const {
    defaultValue = null,
    value: valueParam,
    onValueChange,
    actionsRef,
    delay = 50,
    closeDelay = 50,
    orientation = 'horizontal',
    onOpenChangeComplete
  } = componentProps;
  const nested = useFloatingParentNodeId() != null;
  const parentRootContext = useNavigationMenuRootContext(true);
  const [value, setValueUnwrapped] = useControlled({
    controlled: valueParam,
    default: defaultValue,
    name: 'NavigationMenu',
    state: 'value'
  });

  // Derive open state from value being non-nullish
  const open = value != null;
  const closeReasonRef = React.useRef(undefined);
  const rootRef = React.useRef(null);
  const [positionerElement, setPositionerElement] = React.useState(null);
  const [popupElement, setPopupElement] = React.useState(null);
  const [viewportElement, setViewportElement] = React.useState(null);
  const [viewportTargetElement, setViewportTargetElement] = React.useState(null);
  const [activationDirection, setActivationDirection] = React.useState(null);
  const [floatingRootContext, setFloatingRootContext] = React.useState(undefined);
  const [viewportInert, setViewportInert] = React.useState(false);
  const prevTriggerElementRef = React.useRef(null);
  const currentContentRef = React.useRef(null);
  const beforeInsideRef = React.useRef(null);
  const afterInsideRef = React.useRef(null);
  const beforeOutsideRef = React.useRef(null);
  const afterOutsideRef = React.useRef(null);
  const {
    mounted,
    setMounted,
    transitionStatus
  } = useTransitionStatus(open);
  React.useEffect(() => {
    setViewportInert(false);
  }, [value]);
  const setValue = useStableCallback((nextValue, eventDetails) => {
    if (!nextValue) {
      closeReasonRef.current = eventDetails.reason;
      setActivationDirection(null);
      setFloatingRootContext(undefined);
      if (positionerElement && popupElement) {
        setSharedFixedSize(popupElement, positionerElement);
      }
    }
    if (nextValue !== value) {
      onValueChange?.(nextValue, eventDetails);
    }
    if (eventDetails.isCanceled) {
      return;
    }
    setValueUnwrapped(nextValue);
    if (nested && !nextValue && eventDetails.reason === REASONS.linkPress && parentRootContext) {
      parentRootContext.setValue(null, eventDetails);
    }
  });
  const handleUnmount = useStableCallback(() => {
    const doc = ownerDocument(rootRef.current);
    const activeEl = activeElement(doc);
    const isReturnFocusBlocked = closeReasonRef.current ? blockedReturnFocusReasons.has(closeReasonRef.current) : false;
    if (!isReturnFocusBlocked && isHTMLElement(prevTriggerElementRef.current) && (activeEl === ownerDocument(popupElement).body || contains(popupElement, activeEl)) && popupElement) {
      prevTriggerElementRef.current.focus({
        preventScroll: true
      });
      prevTriggerElementRef.current = undefined;
    }
    setMounted(false);
    onOpenChangeComplete?.(false);
    setActivationDirection(null);
    setFloatingRootContext(undefined);
    currentContentRef.current = null;
    closeReasonRef.current = undefined;
  });
  useOpenChangeComplete({
    enabled: !actionsRef,
    open,
    ref: {
      current: popupElement
    },
    onComplete() {
      if (!open) {
        handleUnmount();
      }
    }
  });
  useOpenChangeComplete({
    enabled: !actionsRef,
    open,
    ref: {
      current: viewportTargetElement
    },
    onComplete() {
      if (!open) {
        handleUnmount();
      }
    }
  });
  const contextValue = React.useMemo(() => ({
    open,
    value,
    setValue,
    mounted,
    transitionStatus,
    positionerElement,
    setPositionerElement,
    popupElement,
    setPopupElement,
    viewportElement,
    setViewportElement,
    viewportTargetElement,
    setViewportTargetElement,
    activationDirection,
    setActivationDirection,
    floatingRootContext,
    setFloatingRootContext,
    currentContentRef,
    nested,
    rootRef,
    beforeInsideRef,
    afterInsideRef,
    beforeOutsideRef,
    afterOutsideRef,
    prevTriggerElementRef,
    delay,
    closeDelay,
    orientation,
    viewportInert,
    setViewportInert
  }), [open, value, setValue, mounted, transitionStatus, positionerElement, popupElement, viewportElement, viewportTargetElement, activationDirection, floatingRootContext, nested, delay, closeDelay, orientation, viewportInert]);
  const jsx = /*#__PURE__*/_jsx(NavigationMenuRootContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(TreeContext, {
      componentProps: componentProps,
      forwardedRef: forwardedRef,
      children: componentProps.children
    })
  });
  if (!nested) {
    // FloatingTree provides context to nested menus
    return /*#__PURE__*/_jsx(FloatingTree, {
      children: jsx
    });
  }
  return jsx;
});
if (process.env.NODE_ENV !== "production") NavigationMenuRoot.displayName = "NavigationMenuRoot";
function TreeContext(props) {
  const {
    className,
    render,
    defaultValue,
    value: valueParam,
    onValueChange,
    actionsRef,
    delay,
    closeDelay,
    orientation,
    onOpenChangeComplete,
    ...elementProps
  } = props.componentProps;
  const nodeId = useFloatingNodeId();
  const {
    rootRef,
    nested
  } = useNavigationMenuRootContext();
  const {
    open
  } = useNavigationMenuRootContext();
  const state = {
    open,
    nested
  };
  const element = useRenderElement(nested ? 'div' : 'nav', props.componentProps, {
    state,
    ref: [props.forwardedRef, rootRef],
    props: elementProps
  });
  return /*#__PURE__*/_jsx(NavigationMenuTreeContext.Provider, {
    value: nodeId,
    children: /*#__PURE__*/_jsx(FloatingNode, {
      id: nodeId,
      children: element
    })
  });
}