"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FloatingPortal = void 0;
exports.useFloatingPortalNode = useFloatingPortalNode;
exports.usePortalContext = void 0;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _dom = require("@floating-ui/utils/dom");
var _useId = require("@base-ui/utils/useId");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _FocusGuard = require("../../utils/FocusGuard");
var _utils = require("../utils");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _createAttribute = require("../utils/createAttribute");
var _useRenderElement = require("../../utils/useRenderElement");
var _constants = require("../../utils/constants");
var _jsxRuntime = require("react/jsx-runtime");
const PortalContext = /*#__PURE__*/React.createContext(null);
if (process.env.NODE_ENV !== "production") PortalContext.displayName = "PortalContext";
const usePortalContext = () => React.useContext(PortalContext);
exports.usePortalContext = usePortalContext;
const attr = (0, _createAttribute.createAttribute)('portal');
function useFloatingPortalNode(props = {}) {
  const {
    ref,
    container: containerProp,
    componentProps = _constants.EMPTY_OBJECT,
    elementProps
  } = props;
  const uniqueId = (0, _useId.useId)();
  const portalContext = usePortalContext();
  const parentPortalNode = portalContext?.portalNode;
  const [containerElement, setContainerElement] = React.useState(null);
  const [portalNode, setPortalNode] = React.useState(null);
  const setPortalNodeRef = (0, _useStableCallback.useStableCallback)(node => {
    if (node !== null) {
      // the useIsoLayoutEffect below watching containerProp / parentPortalNode
      // sets setPortalNode(null) when the container becomes null or changes.
      // So even though the ref callback now ignores null, the portal node still gets cleared.
      setPortalNode(node);
    }
  });
  const containerRef = React.useRef(null);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
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
    const resolvedContainer = (containerProp && ((0, _dom.isNode)(containerProp) ? containerProp : containerProp.current)) ?? parentPortalNode ?? document.body;
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
  const portalElement = (0, _useRenderElement.useRenderElement)('div', componentProps, {
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
const FloatingPortal = exports.FloatingPortal = /*#__PURE__*/React.forwardRef(function FloatingPortal(componentProps, forwardedRef) {
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
      if (portalNode && event.relatedTarget && (0, _utils.isOutsideEvent)(event)) {
        const focusing = event.type === 'focusin';
        const manageFocus = focusing ? _utils.enableFocusInside : _utils.disableFocusInside;
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
    (0, _utils.enableFocusInside)(portalNode);
  }, [open, portalNode]);
  const portalContextValue = React.useMemo(() => ({
    beforeOutsideRef,
    afterOutsideRef,
    beforeInsideRef,
    afterInsideRef,
    portalNode,
    setFocusManagerState
  }), [portalNode]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [portalSubtree, /*#__PURE__*/(0, _jsxRuntime.jsxs)(PortalContext.Provider, {
      value: portalContextValue,
      children: [shouldRenderGuards && portalNode && /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
        "data-type": "outside",
        ref: beforeOutsideRef,
        onFocus: event => {
          if ((0, _utils.isOutsideEvent)(event, portalNode)) {
            beforeInsideRef.current?.focus();
          } else {
            const domReference = focusManagerState ? focusManagerState.domReference : null;
            const prevTabbable = (0, _utils.getPreviousTabbable)(domReference);
            prevTabbable?.focus();
          }
        }
      }), shouldRenderGuards && portalNode && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        "aria-owns": portalNode.id,
        style: _constants.ownerVisuallyHidden
      }), portalNode && /*#__PURE__*/ReactDOM.createPortal(children, portalNode), shouldRenderGuards && portalNode && /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
        "data-type": "outside",
        ref: afterOutsideRef,
        onFocus: event => {
          if ((0, _utils.isOutsideEvent)(event, portalNode)) {
            afterInsideRef.current?.focus();
          } else {
            const domReference = focusManagerState ? focusManagerState.domReference : null;
            const nextTabbable = (0, _utils.getNextTabbable)(domReference);
            nextTabbable?.focus();
            if (focusManagerState?.closeOnFocusOut) {
              focusManagerState?.onOpenChange(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.focusOut, event.nativeEvent));
            }
          }
        }
      })]
    })]
  });
});
if (process.env.NODE_ENV !== "production") FloatingPortal.displayName = "FloatingPortal";