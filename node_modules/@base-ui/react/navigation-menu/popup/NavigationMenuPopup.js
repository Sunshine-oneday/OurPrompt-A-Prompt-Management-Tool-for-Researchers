"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationMenuPopup = void 0;
var React = _interopRequireWildcard(require("react"));
var _useRenderElement = require("../../utils/useRenderElement");
var _NavigationMenuRootContext = require("../root/NavigationMenuRootContext");
var _stateAttributesMapping = require("../../utils/stateAttributesMapping");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _NavigationMenuPositionerContext = require("../positioner/NavigationMenuPositionerContext");
var _DirectionContext = require("../../direction-provider/DirectionContext");
var _popupStateMapping = require("../../utils/popupStateMapping");
const stateAttributesMapping = {
  ..._popupStateMapping.popupStateMapping,
  ..._stateAttributesMapping.transitionStatusMapping
};

/**
 * A container for the navigation menu contents.
 * Renders a `<nav>` element.
 *
 * Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
 */
const NavigationMenuPopup = exports.NavigationMenuPopup = /*#__PURE__*/React.forwardRef(function NavigationMenuPopup(componentProps, forwardedRef) {
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
  } = (0, _NavigationMenuRootContext.useNavigationMenuRootContext)();
  const positioning = (0, _NavigationMenuPositionerContext.useNavigationMenuPositionerContext)();
  const direction = (0, _DirectionContext.useDirection)();
  const id = (0, _useBaseUiId.useBaseUiId)(idProp);
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
  const element = (0, _useRenderElement.useRenderElement)('nav', componentProps, {
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