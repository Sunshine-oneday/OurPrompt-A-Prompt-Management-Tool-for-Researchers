"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TabsList = void 0;
var React = _interopRequireWildcard(require("react"));
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _CompositeRoot = require("../../composite/root/CompositeRoot");
var _stateAttributesMapping = require("../root/stateAttributesMapping");
var _TabsRootContext = require("../root/TabsRootContext");
var _TabsListContext = require("./TabsListContext");
var _constants = require("../../utils/constants");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups the individual tab buttons.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
 */
const TabsList = exports.TabsList = /*#__PURE__*/React.forwardRef(function TabsList(componentProps, forwardedRef) {
  const {
    activateOnFocus = false,
    className,
    loopFocus = true,
    render,
    ...elementProps
  } = componentProps;
  const {
    getTabElementBySelectedValue,
    onValueChange,
    orientation,
    value,
    setTabMap,
    tabActivationDirection
  } = (0, _TabsRootContext.useTabsRootContext)();
  const [highlightedTabIndex, setHighlightedTabIndex] = React.useState(0);
  const [tabsListElement, setTabsListElement] = React.useState(null);
  const indicatorUpdateListenersRef = React.useRef(new Set());
  const tabResizeObserverElementsRef = React.useRef(new Set());
  const resizeObserverRef = React.useRef(null);
  const notifyIndicatorUpdateListeners = (0, _useStableCallback.useStableCallback)(() => {
    indicatorUpdateListenersRef.current.forEach(listener => {
      listener();
    });
  });
  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (!indicatorUpdateListenersRef.current.size) {
        return;
      }
      notifyIndicatorUpdateListeners();
    });
    resizeObserverRef.current = resizeObserver;
    if (tabsListElement) {
      resizeObserver.observe(tabsListElement);
    }
    tabResizeObserverElementsRef.current.forEach(element => {
      resizeObserver.observe(element);
    });
    return () => {
      resizeObserver.disconnect();
      resizeObserverRef.current = null;
    };
  }, [tabsListElement, notifyIndicatorUpdateListeners]);
  const registerIndicatorUpdateListener = (0, _useStableCallback.useStableCallback)(listener => {
    indicatorUpdateListenersRef.current.add(listener);
    return () => {
      indicatorUpdateListenersRef.current.delete(listener);
    };
  });
  const registerTabResizeObserverElement = (0, _useStableCallback.useStableCallback)(element => {
    tabResizeObserverElementsRef.current.add(element);
    resizeObserverRef.current?.observe(element);
    return () => {
      tabResizeObserverElementsRef.current.delete(element);
      resizeObserverRef.current?.unobserve(element);
    };
  });
  const detectActivationDirection = useActivationDirectionDetector(value,
  // the old value
  orientation, tabsListElement, getTabElementBySelectedValue);
  const onTabActivation = (0, _useStableCallback.useStableCallback)((newValue, eventDetails) => {
    if (newValue !== value) {
      const activationDirection = detectActivationDirection(newValue);
      eventDetails.activationDirection = activationDirection;
      onValueChange(newValue, eventDetails);
    }
  });
  const state = {
    orientation,
    tabActivationDirection
  };
  const defaultProps = {
    'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
    role: 'tablist'
  };
  const tabsListContextValue = React.useMemo(() => ({
    activateOnFocus,
    highlightedTabIndex,
    registerIndicatorUpdateListener,
    registerTabResizeObserverElement,
    onTabActivation,
    setHighlightedTabIndex,
    tabsListElement
  }), [activateOnFocus, highlightedTabIndex, registerIndicatorUpdateListener, registerTabResizeObserverElement, onTabActivation, setHighlightedTabIndex, tabsListElement]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_TabsListContext.TabsListContext.Provider, {
    value: tabsListContextValue,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeRoot.CompositeRoot, {
      render: render,
      className: className,
      state: state,
      refs: [forwardedRef, setTabsListElement],
      props: [defaultProps, elementProps],
      stateAttributesMapping: _stateAttributesMapping.tabsStateAttributesMapping,
      highlightedIndex: highlightedTabIndex,
      enableHomeAndEndKeys: true,
      loopFocus: loopFocus,
      orientation: orientation,
      onHighlightedIndexChange: setHighlightedTabIndex,
      onMapChange: setTabMap,
      disabledIndices: _constants.EMPTY_ARRAY
    })
  });
});
if (process.env.NODE_ENV !== "production") TabsList.displayName = "TabsList";
function getInset(tab, tabsList) {
  const {
    left: tabLeft,
    top: tabTop
  } = tab.getBoundingClientRect();
  const {
    left: listLeft,
    top: listTop
  } = tabsList.getBoundingClientRect();
  const left = tabLeft - listLeft;
  const top = tabTop - listTop;
  return {
    left,
    top
  };
}
function useActivationDirectionDetector(
// the old value
activeTabValue, orientation, tabsListElement, getTabElement) {
  const [previousTabEdge, setPreviousTabEdge] = React.useState(null);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    // Whenever orientation changes, reset the state.
    if (activeTabValue == null || tabsListElement == null) {
      setPreviousTabEdge(null);
      return;
    }
    const activeTab = getTabElement(activeTabValue);
    if (activeTab == null) {
      setPreviousTabEdge(null);
      return;
    }
    const {
      left,
      top
    } = getInset(activeTab, tabsListElement);
    setPreviousTabEdge(orientation === 'horizontal' ? left : top);
  }, [orientation, getTabElement, tabsListElement, activeTabValue]);
  return React.useCallback(newValue => {
    if (newValue === activeTabValue) {
      return 'none';
    }
    if (newValue == null) {
      setPreviousTabEdge(null);
      return 'none';
    }
    if (newValue != null && tabsListElement != null) {
      const activeTabElement = getTabElement(newValue);
      if (activeTabElement != null) {
        const {
          left,
          top
        } = getInset(activeTabElement, tabsListElement);
        if (previousTabEdge == null) {
          setPreviousTabEdge(orientation === 'horizontal' ? left : top);
          return 'none';
        }
        if (orientation === 'horizontal') {
          if (left < previousTabEdge) {
            setPreviousTabEdge(left);
            return 'left';
          }
          if (left > previousTabEdge) {
            setPreviousTabEdge(left);
            return 'right';
          }
        } else if (top < previousTabEdge) {
          setPreviousTabEdge(top);
          return 'up';
        } else if (top > previousTabEdge) {
          setPreviousTabEdge(top);
          return 'down';
        }
      }
    }
    return 'none';
  }, [getTabElement, orientation, previousTabEdge, tabsListElement, activeTabValue]);
}