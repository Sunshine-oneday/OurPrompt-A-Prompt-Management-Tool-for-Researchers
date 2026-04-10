"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PreviewCardPositioner = void 0;
var React = _interopRequireWildcard(require("react"));
var _PreviewCardContext = require("../root/PreviewCardContext");
var _PreviewCardPositionerContext = require("./PreviewCardPositionerContext");
var _floatingUiReact = require("../../floating-ui-react");
var _useAnchorPositioning = require("../../utils/useAnchorPositioning");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _PreviewCardPortalContext = require("../portal/PreviewCardPortalContext");
var _constants = require("../../utils/constants");
var _useRenderElement = require("../../utils/useRenderElement");
var _adaptiveOriginMiddleware = require("../../utils/adaptiveOriginMiddleware");
var _getDisabledMountTransitionStyles = require("../../utils/getDisabledMountTransitionStyles");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Positions the popup against the trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Preview Card](https://base-ui.com/react/components/preview-card)
 */
const PreviewCardPositioner = exports.PreviewCardPositioner = /*#__PURE__*/React.forwardRef(function PreviewCardPositioner(componentProps, forwardedRef) {
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
  const store = (0, _PreviewCardContext.usePreviewCardRootContext)();
  const keepMounted = (0, _PreviewCardPortalContext.usePreviewCardPortalContext)();
  const nodeId = (0, _floatingUiReact.useFloatingNodeId)();
  const open = store.useState('open');
  const mounted = store.useState('mounted');
  const floatingRootContext = store.useState('floatingRootContext');
  const instantType = store.useState('instantType');
  const transitionStatus = store.useState('transitionStatus');
  const hasViewport = store.useState('hasViewport');
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
  const state = {
    open,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    instant: instantType
  };
  const contextValue = React.useMemo(() => ({
    side: positioning.side,
    align: positioning.align,
    arrowRef: positioning.arrowRef,
    arrowUncentered: positioning.arrowUncentered,
    arrowStyles: positioning.arrowStyles
  }), [positioning.side, positioning.align, positioning.arrowRef, positioning.arrowUncentered, positioning.arrowStyles]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    props: [defaultProps, (0, _getDisabledMountTransitionStyles.getDisabledMountTransitionStyles)(transitionStatus), elementProps],
    ref: [forwardedRef, store.useStateSetter('positionerElement')],
    stateAttributesMapping: _popupStateMapping.popupStateMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_PreviewCardPositionerContext.PreviewCardPositionerContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_floatingUiReact.FloatingNode, {
      id: nodeId,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") PreviewCardPositioner.displayName = "PreviewCardPositioner";