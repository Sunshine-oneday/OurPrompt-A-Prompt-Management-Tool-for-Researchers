'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isNode } from '@floating-ui/utils/dom';
import { useId } from '@base-ui/utils/useId';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { FocusGuard } from "../../utils/FocusGuard.js";
import { enableFocusInside, disableFocusInside, getPreviousTabbable, getNextTabbable, isOutsideEvent } from "../utils.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { createAttribute } from "../utils/createAttribute.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { EMPTY_OBJECT, ownerVisuallyHidden } from "../../utils/constants.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const PortalContext = /*#__PURE__*/React.createContext(null);
if (process.env.NODE_ENV !== "production") PortalContext.displayName = "PortalContext";
export const usePortalContext = () => React.useContext(PortalContext);
const attr = createAttribute('portal');
export function useFloatingPortalNode(props = {}) {
  const {
    ref,
    container: containerProp,
    componentProps = EMPTY_OBJECT,
    elementProps
  } = props;
  const uniqueId = useId();
  const portalContext = usePortalContext();
  const parentPortalNode = portalContext?.portalNode;
  const [containerElement, setContainerElement] = React.useState(null);
  const [portalNode, setPortalNode] = React.useState(null);
  const setPortalNodeRef = useStableCallback(node => {
    if (node !== null) {
      // the useIsoLayoutEffect below watching containerProp / parentPortalNode
      // sets setPortalNode(null) when the container becomes null or changes.
      // So even though the ref callback now ignores null, the portal node still gets cleared.
      setPortalNode(node);
    }
  });
  const containerRef = React.useRef(null);
  useIsoLayoutEffect(() => {
    // Wait for the container to be resolved if explicitly `null`.
    if (containerProp === null) {
      if (containerRef.current) {
        containerRef.current = null;
        setPortalNode(null);
        setContainerElement(null);
      }
      return;
    }

    // React 17 does not use React.useId().
    if (uniqueId == null) {
      return;
    }
    const resolvedContainer = (containerProp && (isNode(containerProp) ? containerProp : containerProp.current)) ?? parentPortalNode ?? document.body;
    if (resolvedContainer == null) {
      if (containerRef.current) {
        containerRef.current = null;
        setPortalNode(null);
        setContainerElement(null);
      }
      return;
    }
    if (containerRef.current !== resolvedContainer) {
      containerRef.current = resolvedContainer;
      setPortalNode(null);
      setContainerElement(resolvedContainer);
    }
  }, [containerProp, parentPortalNode, uniqueId]);
  const portalElement = useRenderElement('div', componentProps, {
    ref: [ref, setPortalNodeRef],
    props: [{
      id: uniqueId,
      [attr]: ''
    }, elementProps]
  });

  // This `createPortal` call injects `portalElement` into the `container`.
  // Another call inside `FloatingPortal`/`FloatingPortalLite` then injects the children into `portalElement`.
  const portalSubtree = containerElement && portalElement ? /*#__PURE__*/ReactDOM.createPortal(portalElement, containerElement) : null;
  return {
    portalNode,
    portalSubtree
  };
}

/**
 * Portals the floating element into a given container element — by default,
 * outside of the app root and into the body.
 * This is necessary to ensure the floating element can appear outside any
 * potential parent containers that cause clipping (such as `overflow: hidden`),
 * while retaining its location in the React tree.
 * @see https://floating-ui.com/docs/FloatingPortal
 * @internal
 */
export const FloatingPortal = /*#__PURE__*/React.forwardRef(function FloatingPortal(componentProps, forwardedRef) {
  const {
    children,
    container,
    className,
    render,
    renderGuards,
    ...elementProps
  } = componentProps;
  const {
    portalNode,
    portalSubtree
  } = useFloatingPortalNode({
    container,
    ref: forwardedRef,
    componentProps,
    elementProps
  });
  const beforeOutsideRef = React.useRef(null);
  const afterOutsideRef = React.useRef(null);
  const beforeInsideRef = React.useRef(null);
  const afterInsideRef = React.useRef(null);
  const [focusManagerState, setFocusManagerState] = React.useState(null);
  const modal = focusManagerState?.modal;
  const open = focusManagerState?.open;
  const shouldRenderGuards = typeof renderGuards === 'boolean' ? renderGuards : !!focusManagerState && !focusManagerState.modal && focusManagerState.open && !!portalNode;

  // https://codesandbox.io/s/tabbable-portal-f4tng?file=/src/TabbablePortal.tsx
  React.useEffect(() => {
    if (!portalNode || modal) {
      return undefined;
    }

    // Make sure elements inside the portal element are tabbable only when the
    // portal has already been focused, either by tabbing into a focus trap
    // element outside or using the mouse.
    function onFocus(event) {
      if (portalNode && event.relatedTarget && isOutsideEvent(event)) {
        const focusing = event.type === 'focusin';
        const manageFocus = focusing ? enableFocusInside : disableFocusInside;
        manageFocus(portalNode);
      }
    }

    // Listen to the event on the capture phase so they run before the focus
    // trap elements onFocus prop is called.
    portalNode.addEventListener('focusin', onFocus, true);
    portalNode.addEventListener('focusout', onFocus, true);
    return () => {
      portalNode.removeEventListener('focusin', onFocus, true);
      portalNode.removeEventListener('focusout', onFocus, true);
    };
  }, [portalNode, modal]);
  React.useEffect(() => {
    if (!portalNode || open) {
      return;
    }
    enableFocusInside(portalNode);
  }, [open, portalNode]);
  const portalContextValue = React.useMemo(() => ({
    beforeOutsideRef,
    afterOutsideRef,
    beforeInsideRef,
    afterInsideRef,
    portalNode,
    setFocusManagerState
  }), [portalNode]);
  return /*#__PURE__*/_jsxs(React.Fragment, {
    children: [portalSubtree, /*#__PURE__*/_jsxs(PortalContext.Provider, {
      value: portalContextValue,
      children: [shouldRenderGuards && portalNode && /*#__PURE__*/_jsx(FocusGuard, {
        "data-type": "outside",
        ref: beforeOutsideRef,
        onFocus: event => {
          if (isOutsideEvent(event, portalNode)) {
            beforeInsideRef.current?.focus();
          } else {
            const domReference = focusManagerState ? focusManagerState.domReference : null;
            const prevTabbable = getPreviousTabbable(domReference);
            prevTabbable?.focus();
          }
        }
      }), shouldRenderGuards && portalNode && /*#__PURE__*/_jsx("span", {
        "aria-owns": portalNode.id,
        style: ownerVisuallyHidden
      }), portalNode && /*#__PURE__*/ReactDOM.createPortal(children, portalNode), shouldRenderGuards && portalNode && /*#__PURE__*/_jsx(FocusGuard, {
        "data-type": "outside",
        ref: afterOutsideRef,
        onFocus: event => {
          if (isOutsideEvent(event, portalNode)) {
            afterInsideRef.current?.focus();
          } else {
            const domReference = focusManagerState ? focusManagerState.domReference : null;
            const nextTabbable = getNextTabbable(domReference);
            nextTabbable?.focus();
            if (focusManagerState?.closeOnFocusOut) {
              focusManagerState?.onOpenChange(false, createChangeEventDetails(REASONS.focusOut, event.nativeEvent));
            }
          }
        }
      })]
    })]
  });
});
if (process.env.NODE_ENV !== "production") FloatingPortal.displayName = "FloatingPortal";