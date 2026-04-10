'use client';

import * as React from 'react';
import { useForcedRerendering } from '@base-ui/utils/useForcedRerendering';
import { useOnMount } from '@base-ui/utils/useOnMount';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { getCssDimensions } from "../../utils/getCssDimensions.js";
import { useTabsRootContext } from "../root/TabsRootContext.js";
import { tabsStateAttributesMapping } from "../root/stateAttributesMapping.js";
import { useTabsListContext } from "../list/TabsListContext.js";
import { script as prehydrationScript } from "./prehydrationScript.min.js";
import { TabsIndicatorCssVars } from "./TabsIndicatorCssVars.js";
import { useCSPContext } from "../../csp-provider/CSPContext.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const stateAttributesMapping = {
  ...tabsStateAttributesMapping,
  activeTabPosition: () => null,
  activeTabSize: () => null
};

/**
 * A visual indicator that can be styled to match the position of the currently active tab.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
 */
export const TabsIndicator = /*#__PURE__*/React.forwardRef(function TabIndicator(componentProps, forwardedRef) {
  const {
    className,
    render,
    renderBeforeHydration = false,
    ...elementProps
  } = componentProps;
  const {
    nonce
  } = useCSPContext();
  const {
    getTabElementBySelectedValue,
    orientation,
    tabActivationDirection,
    value
  } = useTabsRootContext();
  const {
    tabsListElement,
    registerIndicatorUpdateListener
  } = useTabsListContext();
  const [isMounted, setIsMounted] = React.useState(false);
  useOnMount(() => setIsMounted(true));
  const rerender = useForcedRerendering();
  React.useEffect(() => {
    return registerIndicatorUpdateListener(rerender);
  }, [registerIndicatorUpdateListener, rerender]);
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;
  let width = 0;
  let height = 0;
  let isTabSelected = false;
  if (value != null && tabsListElement != null) {
    const activeTab = getTabElementBySelectedValue(value);
    isTabSelected = true;
    if (activeTab != null) {
      const {
        width: computedWidth,
        height: computedHeight
      } = getCssDimensions(activeTab);
      const {
        width: tabListWidth,
        height: tabListHeight
      } = getCssDimensions(tabsListElement);
      const tabRect = activeTab.getBoundingClientRect();
      const tabsListRect = tabsListElement.getBoundingClientRect();
      const scaleX = tabListWidth > 0 ? tabsListRect.width / tabListWidth : 1;
      const scaleY = tabListHeight > 0 ? tabsListRect.height / tabListHeight : 1;
      const hasNonZeroScale = Math.abs(scaleX) > Number.EPSILON && Math.abs(scaleY) > Number.EPSILON;
      if (hasNonZeroScale) {
        const tabLeftDelta = tabRect.left - tabsListRect.left;
        const tabTopDelta = tabRect.top - tabsListRect.top;
        left = tabLeftDelta / scaleX + tabsListElement.scrollLeft - tabsListElement.clientLeft;
        top = tabTopDelta / scaleY + tabsListElement.scrollTop - tabsListElement.clientTop;
      } else {
        left = activeTab.offsetLeft;
        top = activeTab.offsetTop;
      }
      width = computedWidth;
      height = computedHeight;
      right = tabsListElement.scrollWidth - left - width;
      bottom = tabsListElement.scrollHeight - top - height;
    }
  }
  const activeTabPosition = React.useMemo(() => isTabSelected ? {
    left,
    right,
    top,
    bottom
  } : null, [left, right, top, bottom, isTabSelected]);
  const activeTabSize = React.useMemo(() => isTabSelected ? {
    width,
    height
  } : null, [width, height, isTabSelected]);
  const style = React.useMemo(() => {
    if (!isTabSelected) {
      return undefined;
    }
    return {
      [TabsIndicatorCssVars.activeTabLeft]: `${left}px`,
      [TabsIndicatorCssVars.activeTabRight]: `${right}px`,
      [TabsIndicatorCssVars.activeTabTop]: `${top}px`,
      [TabsIndicatorCssVars.activeTabBottom]: `${bottom}px`,
      [TabsIndicatorCssVars.activeTabWidth]: `${width}px`,
      [TabsIndicatorCssVars.activeTabHeight]: `${height}px`
    };
  }, [left, right, top, bottom, width, height, isTabSelected]);
  const displayIndicator = isTabSelected && width > 0 && height > 0;
  const state = {
    orientation,
    activeTabPosition,
    activeTabSize,
    tabActivationDirection
  };
  const element = useRenderElement('span', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      role: 'presentation',
      style,
      hidden: !displayIndicator // do not display the indicator before the layout is settled
    }, elementProps, {
      suppressHydrationWarning: true
    }],
    stateAttributesMapping
  });
  if (value == null) {
    return null;
  }
  return /*#__PURE__*/_jsxs(React.Fragment, {
    children: [element, !isMounted && renderBeforeHydration && /*#__PURE__*/_jsx("script", {
      nonce: nonce
      // eslint-disable-next-line react/no-danger
      ,
      dangerouslySetInnerHTML: {
        __html: prehydrationScript
      },
      suppressHydrationWarning: true
    })]
  });
});
if (process.env.NODE_ENV !== "production") TabsIndicator.displayName = "TabsIndicator";