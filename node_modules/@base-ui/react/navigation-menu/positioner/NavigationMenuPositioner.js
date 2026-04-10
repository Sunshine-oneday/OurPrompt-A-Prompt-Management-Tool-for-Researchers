"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationMenuPositioner = void 0;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _owner = require("@base-ui/utils/owner");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _utils = require("../../floating-ui-react/utils");
var _getEmptyRootContext = require("../../floating-ui-react/utils/getEmptyRootContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _NavigationMenuRootContext = require("../root/NavigationMenuRootContext");
var _NavigationMenuPortalContext = require("../portal/NavigationMenuPortalContext");
var _useAnchorPositioning = require("../../utils/useAnchorPositioning");
var _NavigationMenuPositionerContext = require("./NavigationMenuPositionerContext");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _constants = require("../../utils/constants");
var _adaptiveOriginMiddleware = require("../../utils/adaptiveOriginMiddleware");
var _getDisabledMountTransitionStyles = require("../../utils/getDisabledMountTransitionStyles");
var _jsxRuntime = require("react/jsx-runtime");
const EMPTY_ROOT_CONTEXT = (0, _getEmptyRootContext.getEmptyRootContext)();

/**
 * Positions the navigation menu against the currently active trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
 */
const NavigationMenuPositioner = exports.NavigationMenuPositioner = /*#__PURE__*/React.forwardRef(function NavigationMenuPositioner(componentProps, forwardedRef) {
  const {
    open,
    mounted,
    positionerElement,
    setPositionerElement,
    floatingRootContext,
    nested,
    transitionStatus
  } = (0, _NavigationMenuRootContext.useNavigationMenuRootContext)();
  const {
    className,
    render,
    anchor,
    positionMethod = 'absolute',
    side = 'bottom',
    align = 'center',
    sideOffset = 0,
    alignOffset = 0,
    collisionBoundary = 'clipping-ancestors',
    collisionPadding = 5,
    collisionAvoidance = nested ? _constants.POPUP_COLLISION_AVOIDANCE : _constants.DROPDOWN_COLLISION_AVOIDANCE,
    arrowPadding = 5,
    sticky = false,
    disableAnchorTracking = false,
    ...elementProps
  } = componentProps;
  const keepMounted = (0, _NavigationMenuPortalContext.useNavigationMenuPortalContext)();
  const nodeId = (0, _NavigationMenuRootContext.useNavigationMenuTreeContext)();
  const resizeTimeout = (0, _useTimeout.useTimeout)();
  const [instant, setInstant] = React.useState(false);
  const positionerRef = React.useRef(null);
  const prevTriggerElementRef = React.useRef(null);

  // https://codesandbox.io/s/tabbable-portal-f4tng?file=/src/TabbablePortal.tsx
  React.useEffect(() => {
    if (!positionerElement) {
      return undefined;
    }

    // Make sure elements inside the portal element are tabbable only when the
    // portal has already been focused, either by tabbing into a focus trap
    // element outside or using the mouse.
    function onFocus(event) {
      if (positionerElement && (0, _utils.isOutsideEvent)(event)) {
        const focusing = event.type === 'focusin';
        const manageFocus = focusing ? _utils.enableFocusInside : _utils.disableFocusInside;
        manageFocus(positionerElement);
      }
    }

    // Listen to the event on the capture phase so they run before the focus
    // trap elements onFocus prop is called.
    positionerElement.addEventListener('focusin', onFocus, true);
    positionerElement.addEventListener('focusout', onFocus, true);
    return () => {
      positionerElement.removeEventListener('focusin', onFocus, true);
      positionerElement.removeEventListener('focusout', onFocus, true);
    };
  }, [positionerElement]);
  const domReference = (floatingRootContext || EMPTY_ROOT_CONTEXT).useState('domReferenceElement');
  const positioning = (0, _useAnchorPositioning.useAnchorPositioning)({
    anchor: anchor ?? domReference ?? prevTriggerElementRef,
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
    floatingRootContext,
    collisionAvoidance,
    nodeId,
    // Allows the menu to remain anchored without wobbling while its size
    // and position transition simultaneously when side=top or side=left.
    adaptiveOrigin: _adaptiveOriginMiddleware.adaptiveOrigin
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
    instant
  };
  React.useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handleResize() {
      ReactDOM.flushSync(() => {
        setInstant(true);
      });
      resizeTimeout.start(100, () => {
        setInstant(false);
      });
    }
    const win = (0, _owner.ownerWindow)(positionerElement);
    win.addEventListener('resize', handleResize);
    return () => {
      win.removeEventListener('resize', handleResize);
    };
  }, [open, resizeTimeout, positionerElement]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    ref: [forwardedRef, setPositionerElement, positionerRef],
    props: [defaultProps, (0, _getDisabledMountTransitionStyles.getDisabledMountTransitionStyles)(transitionStatus), elementProps],
    stateAttributesMapping: _popupStateMapping.popupStateMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_NavigationMenuPositionerContext.NavigationMenuPositionerContext.Provider, {
    value: positioning,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") NavigationMenuPositioner.displayName = "NavigationMenuPositioner";