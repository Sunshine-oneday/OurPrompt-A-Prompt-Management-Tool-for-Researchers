"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PopoverPositioner = void 0;
var React = _interopRequireWildcard(require("react"));
var _inertValue = require("@base-ui/utils/inertValue");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _floatingUiReact = require("../../floating-ui-react");
var _PopoverRootContext = require("../root/PopoverRootContext");
var _PopoverPositionerContext = require("./PopoverPositionerContext");
var _useAnchorPositioning = require("../../utils/useAnchorPositioning");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _PopoverPortalContext = require("../portal/PopoverPortalContext");
var _InternalBackdrop = require("../../utils/InternalBackdrop");
var _reasons = require("../../utils/reasons");
var _useRenderElement = require("../../utils/useRenderElement");
var _constants = require("../../utils/constants");
var _useAnimationsFinished = require("../../utils/useAnimationsFinished");
var _adaptiveOriginMiddleware = require("../../utils/adaptiveOriginMiddleware");
var _getDisabledMountTransitionStyles = require("../../utils/getDisabledMountTransitionStyles");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Positions the popover against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
const PopoverPositioner = exports.PopoverPositioner = /*#__PURE__*/React.forwardRef(function PopoverPositioner(componentProps, forwardedRef) {
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
    collisionAvoidance = _constants.POPUP_COLLISION_AVOIDANCE,
    ...elementProps
  } = componentProps;
  const {
    store
  } = (0, _PopoverRootContext.usePopoverRootContext)();
  const keepMounted = (0, _PopoverPortalContext.usePopoverPortalContext)();
  const nodeId = (0, _floatingUiReact.useFloatingNodeId)();
  const floatingRootContext = store.useState('floatingRootContext');
  const mounted = store.useState('mounted');
  const open = store.useState('open');
  const openReason = store.useState('openChangeReason');
  const triggerElement = store.useState('activeTriggerElement');
  const modal = store.useState('modal');
  const positionerElement = store.useState('positionerElement');
  const instantType = store.useState('instantType');
  const transitionStatus = store.useState('transitionStatus');
  const hasViewport = store.useState('hasViewport');
  const prevTriggerElementRef = React.useRef(null);
  const runOnceAnimationsFinish = (0, _useAnimationsFinished.useAnimationsFinished)(positionerElement, false, false);
  const positioning = (0, _useAnchorPositioning.useAnchorPositioning)({
    anchor,
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
    nodeId,
    collisionAvoidance,
    adaptiveOrigin: hasViewport ? _adaptiveOriginMiddleware.adaptiveOrigin : undefined
  });
  const defaultProps = React.useMemo(() => {
    const hiddenStyles = {};
    if (!open) {
      hiddenStyles.pointerEvents = 'none';
    }
    return {
      role: 'presentation',
      hidden: !mounted,
      style: {
        ...positioning.positionerStyles,
        ...hiddenStyles
      }
    };
  }, [open, mounted, positioning.positionerStyles]);
  const positioner = React.useMemo(() => ({
    props: defaultProps,
    ...positioning
  }), [defaultProps, positioning]);
  const domReference = floatingRootContext.useState('domReferenceElement');

  // When the current trigger element changes, enable transitions on the
  // positioner temporarily
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    const currentTriggerElement = domReference;
    const prevTriggerElement = prevTriggerElementRef.current;
    if (currentTriggerElement) {
      prevTriggerElementRef.current = currentTriggerElement;
    }
    if (prevTriggerElement && currentTriggerElement && currentTriggerElement !== prevTriggerElement) {
      store.set('instantType', undefined);
      const ac = new AbortController();
      runOnceAnimationsFinish(() => {
        store.set('instantType', 'trigger-change');
      }, ac.signal);
      return () => {
        ac.abort();
      };
    }
    return undefined;
  }, [domReference, runOnceAnimationsFinish, store]);
  const state = {
    open,
    side: positioner.side,
    align: positioner.align,
    anchorHidden: positioner.anchorHidden,
    instant: instantType
  };
  const setPositionerElement = React.useCallback(element => {
    store.set('positionerElement', element);
  }, [store]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    props: [positioner.props, (0, _getDisabledMountTransitionStyles.getDisabledMountTransitionStyles)(transitionStatus), elementProps],
    ref: [forwardedRef, setPositionerElement],
    stateAttributesMapping: _popupStateMapping.popupStateMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_PopoverPositionerContext.PopoverPositionerContext.Provider, {
    value: positioner,
    children: [mounted && modal === true && openReason !== _reasons.REASONS.triggerHover && /*#__PURE__*/(0, _jsxRuntime.jsx)(_InternalBackdrop.InternalBackdrop, {
      ref: store.context.internalBackdropRef,
      inert: (0, _inertValue.inertValue)(!open),
      cutout: triggerElement
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_floatingUiReact.FloatingNode, {
      id: nodeId,
      children: element
    })]
  });
});
if (process.env.NODE_ENV !== "production") PopoverPositioner.displayName = "PopoverPositioner";