"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationMenuList = void 0;
var React = _interopRequireWildcard(require("react"));
var _floatingUiReact = require("../../floating-ui-react");
var _utils = require("../../floating-ui-react/utils");
var _CompositeRoot = require("../../composite/root/CompositeRoot");
var _NavigationMenuRootContext = require("../root/NavigationMenuRootContext");
var _constants = require("../../utils/constants");
var _constants2 = require("../utils/constants");
var _NavigationMenuDismissContext = require("./NavigationMenuDismissContext");
var _getEmptyRootContext = require("../../floating-ui-react/utils/getEmptyRootContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Contains a list of navigation menu items.
 * Renders a `<ul>` element.
 *
 * Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
 */
const NavigationMenuList = exports.NavigationMenuList = /*#__PURE__*/React.forwardRef(function NavigationMenuList(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const {
    orientation,
    open,
    floatingRootContext,
    positionerElement,
    value,
    closeDelay,
    viewportElement,
    nested
  } = (0, _NavigationMenuRootContext.useNavigationMenuRootContext)();
  const fallbackContext = React.useMemo(() => (0, _getEmptyRootContext.getEmptyRootContext)(), []);
  const context = floatingRootContext || fallbackContext;
  const interactionsEnabled = positionerElement ? true : !value;
  const hoverInteractionsEnabled = positionerElement || viewportElement ? true : !value;
  (0, _floatingUiReact.useHoverFloatingInteraction)(context, {
    enabled: Boolean(floatingRootContext) && hoverInteractionsEnabled,
    closeDelay
  });
  const dismiss = (0, _floatingUiReact.useDismiss)(context, {
    enabled: interactionsEnabled,
    outsidePressEvent: 'intentional',
    outsidePress(event) {
      const target = (0, _utils.getTarget)(event);
      const closestNavigationMenuTrigger = target?.closest(`[${_constants2.NAVIGATION_MENU_TRIGGER_IDENTIFIER}]`);
      return closestNavigationMenuTrigger === null;
    }
  });
  const dismissProps = floatingRootContext ? dismiss : undefined;
  const state = {
    open
  };

  // `stopEventPropagation` won't stop the propagation if the end of the list is reached,
  // but we want to block it in this case.
  // When nested, skip this handler so arrow keys can reach the parent CompositeRoot.
  const defaultProps = nested ? {
    'aria-orientation': orientation
  } : {
    onKeyDown(event) {
      const shouldStop = orientation === 'horizontal' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight') || orientation === 'vertical' && (event.key === 'ArrowUp' || event.key === 'ArrowDown');
      if (shouldStop) {
        event.stopPropagation();
      }
    }
  };
  const props = [dismissProps?.floating || _constants.EMPTY_OBJECT, defaultProps, elementProps];

  // When nested, skip the CompositeRoot wrapper so that triggers can participate
  // in the parent Content's composite navigation context. Also skip the onKeyDown
  // handler that blocks propagation so arrow keys can reach the parent CompositeRoot.
  const element = (0, _useRenderElement.useRenderElement)('ul', componentProps, {
    state,
    ref: forwardedRef,
    props,
    enabled: nested
  });
  if (nested) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_NavigationMenuDismissContext.NavigationMenuDismissContext.Provider, {
      value: dismissProps,
      children: element
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_NavigationMenuDismissContext.NavigationMenuDismissContext.Provider, {
    value: dismissProps,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeRoot.CompositeRoot, {
      render: render,
      className: className,
      state: state,
      refs: [forwardedRef],
      props: props,
      loopFocus: false,
      orientation: orientation,
      tag: "ul"
    })
  });
});
if (process.env.NODE_ENV !== "production") NavigationMenuList.displayName = "NavigationMenuList";