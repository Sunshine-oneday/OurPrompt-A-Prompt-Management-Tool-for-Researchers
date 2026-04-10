'use client';

import * as React from 'react';
import { inertValue } from '@base-ui/utils/inertValue';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { useTransitionStatus } from "../../utils/useTransitionStatus.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useCompositeListItem } from "../../composite/list/useCompositeListItem.js";
import { tabsStateAttributesMapping } from "../root/stateAttributesMapping.js";
import { useTabsRootContext } from "../root/TabsRootContext.js";
import { TabsPanelDataAttributes } from "./TabsPanelDataAttributes.js";
const stateAttributesMapping = {
  ...tabsStateAttributesMapping,
  ...transitionStatusMapping
};

/**
 * A panel displayed when the corresponding tab is active.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
 */
export const TabsPanel = /*#__PURE__*/React.forwardRef(function TabPanel(componentProps, forwardedRef) {
  const {
    className,
    value,
    render,
    keepMounted = false,
    ...elementProps
  } = componentProps;
  const {
    value: selectedValue,
    getTabIdByPanelValue,
    orientation,
    tabActivationDirection,
    registerMountedTabPanel,
    unregisterMountedTabPanel
  } = useTabsRootContext();
  const id = useBaseUiId();
  const metadata = React.useMemo(() => ({
    id,
    value
  }), [id, value]);
  const {
    ref: listItemRef,
    index
  } = useCompositeListItem({
    metadata
  });
  const open = value === selectedValue;
  const {
    mounted,
    transitionStatus,
    setMounted
  } = useTransitionStatus(open);
  const hidden = !mounted;
  const correspondingTabId = getTabIdByPanelValue(value);
  const state = {
    hidden,
    orientation,
    tabActivationDirection,
    transitionStatus
  };
  const panelRef = React.useRef(null);
  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, listItemRef, panelRef],
    props: [{
      'aria-labelledby': correspondingTabId,
      hidden,
      id,
      role: 'tabpanel',
      tabIndex: open ? 0 : -1,
      inert: inertValue(!open),
      [TabsPanelDataAttributes.index]: index
    }, elementProps],
    stateAttributesMapping
  });
  useOpenChangeComplete({
    open,
    ref: panelRef,
    onComplete() {
      if (!open) {
        setMounted(false);
      }
    }
  });
  useIsoLayoutEffect(() => {
    if (hidden && !keepMounted) {
      return undefined;
    }
    if (id == null) {
      return undefined;
    }
    registerMountedTabPanel(value, id);
    return () => {
      unregisterMountedTabPanel(value, id);
    };
  }, [hidden, keepMounted, value, id, registerMountedTabPanel, unregisterMountedTabPanel]);
  const shouldRender = keepMounted || mounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") TabsPanel.displayName = "TabsPanel";