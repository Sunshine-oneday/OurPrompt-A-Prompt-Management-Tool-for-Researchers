"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TooltipPositioner = void 0;
var React = _interopRequireWildcard(require("react"));
var _TooltipRootContext = require("../root/TooltipRootContext");
var _TooltipPositionerContext = require("./TooltipPositionerContext");
var _useAnchorPositioning = require("../../utils/useAnchorPositioning");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _TooltipPortalContext = require("../portal/TooltipPortalContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _constants = require("../../utils/constants");
var _adaptiveOriginMiddleware = require("../../utils/adaptiveOriginMiddleware");
var _getDisabledMountTransitionStyles = require("../../utils/getDisabledMountTransitionStyles");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Positions the tooltip against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
 */
const TooltipPositioner = exports.TooltipPositioner = /*#__PURE__*/React.forwardRef(function TooltipPositioner(componentProps, forwardedRef) {
  const {
    render,
    className,
    anchor,
    positionMethod = 'absolute',
    side = 'top',
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
  const store = (0, _TooltipRootContext.useTooltipRootContext)();
  const keepMounted = (0, _TooltipPortalContext.useTooltipPortalContext)();
  const open = store.useState('open');
  const mounted = store.useState('mounted');
  const trackCursorAxis = store.useState('trackCursorAxis');
  const disableHoverablePopup = store.useState('disableHoverablePopup');
  const floatingRootContext = store.useState('floatingRootContext');
  const instantType = store.useState('instantType');
  const transitionStatus = store.useState('transitionStatus');
  const hasViewport = store.useState('hasViewport');
  const positioning = (0, _useAnchorPositioning.useAnchorPositioning)({
    anchor,
    positionMethod,
    floatingRootContext,
    mounted,
    side,
    sideOffset,
    align,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    sticky,
    arrowPadding,
    disableAnchorTracking,
    keepMounted,
    collisionAvoidance,
    adaptiveOrigin: hasViewport ? _adaptiveOriginMiddleware.adaptiveOrigin : undefined
  });
  const defaultProps = React.useMemo(() => {
    const hiddenStyles = {};
    if (!open || trackCursorAxis === 'both' || disableHoverablePopup) {
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
  }, [open, trackCursorAxis, disableHoverablePopup, mounted, positioning.positionerStyles]);
  const state = React.useMemo(() => ({
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant: trackCursorAxis !== 'none' ? 'tracking-cursor' : instantType
  }), [open, positioning.side, positioning.align, positioning.anchorHidden, trackCursorAxis, instantType]);
  const contextValue = React.useMemo(() => ({
    ...state,
    arrowRef: positioning.arrowRef,
    arrowStyles: positioning.arrowStyles,
    arrowUncentered: positioning.arrowUncentered
  }), [state, positioning.arrowRef, positioning.arrowStyles, positioning.arrowUncentered]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    props: [defaultProps, (0, _getDisabledMountTransitionStyles.getDisabledMountTransitionStyles)(transitionStatus), elementProps],
    ref: [forwardedRef, store.useStateSetter('positionerElement')],
    stateAttributesMapping: _popupStateMapping.popupStateMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_TooltipPositionerContext.TooltipPositionerContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") TooltipPositioner.displayName = "TooltipPositioner";