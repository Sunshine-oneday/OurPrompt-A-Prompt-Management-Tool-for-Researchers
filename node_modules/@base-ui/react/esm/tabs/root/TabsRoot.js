'use client';

import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { CompositeList } from "../../composite/list/CompositeList.js";
import { useDirection } from "../../direction-provider/DirectionContext.js";
import { TabsRootContext } from "./TabsRootContext.js";
import { tabsStateAttributesMapping } from "./stateAttributesMapping.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Groups the tabs and the corresponding panels.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
 */
export const TabsRoot = /*#__PURE__*/React.forwardRef(function TabsRoot(componentProps, forwardedRef) {
  const {
    className,
    defaultValue: defaultValueProp = 0,
    onValueChange: onValueChangeProp,
    orientation = 'horizontal',
    render,
    value: valueProp,
    ...elementProps
  } = componentProps;
  const direction = useDirection();

  // Track whether the user explicitly provided a `defaultValue` prop.
  // Used to determine if we should honor a disabled tab selection.
  const hasExplicitDefaultValueProp = Object.hasOwn(componentProps, 'defaultValue');
  const tabPanelRefs = React.useRef([]);
  const [mountedTabPanels, setMountedTabPanels] = React.useState(() => new Map());
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValueProp,
    name: 'Tabs',
    state: 'value'
  });
  const isControlled = valueProp !== undefined;
  const [tabMap, setTabMap] = React.useState(() => new Map());
  const [tabActivationDirection, setTabActivationDirection] = React.useState('none');
  const onValueChange = useStableCallback((newValue, eventDetails) => {
    onValueChangeProp?.(newValue, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setValue(newValue);
    setTabActivationDirection(eventDetails.activationDirection);
  });
  const registerMountedTabPanel = useStableCallback((panelValue, panelId) => {
    setMountedTabPanels(prev => {
      if (prev.get(panelValue) === panelId) {
        return prev;
      }
      const next = new Map(prev);
      next.set(panelValue, panelId);
      return next;
    });
  });
  const unregisterMountedTabPanel = useStableCallback((panelValue, panelId) => {
    setMountedTabPanels(prev => {
      if (!prev.has(panelValue) || prev.get(panelValue) !== panelId) {
        return prev;
      }
      const next = new Map(prev);
      next.delete(panelValue);
      return next;
    });
  });

  // get the `id` attribute of <Tabs.Panel> to set as the value of `aria-controls` on <Tabs.Tab>
  const getTabPanelIdByValue = React.useCallback(tabValue => {
    return mountedTabPanels.get(tabValue);
  }, [mountedTabPanels]);

  // get the `id` attribute of <Tabs.Tab> to set as the value of `aria-labelledby` on <Tabs.Panel>
  const getTabIdByPanelValue = React.useCallback(tabPanelValue => {
    for (const tabMetadata of tabMap.values()) {
      if (tabPanelValue === tabMetadata?.value) {
        return tabMetadata?.id;
      }
    }
    return undefined;
  }, [tabMap]);

  // used in `useActivationDirectionDetector` for setting data-activation-direction
  const getTabElementBySelectedValue = React.useCallback(selectedValue => {
    if (selectedValue === undefined) {
      return null;
    }
    for (const [tabElement, tabMetadata] of tabMap.entries()) {
      if (tabMetadata != null && selectedValue === (tabMetadata.value ?? tabMetadata.index)) {
        return tabElement;
      }
    }
    return null;
  }, [tabMap]);
  const tabsContextValue = React.useMemo(() => ({
    direction,
    getTabElementBySelectedValue,
    getTabIdByPanelValue,
    getTabPanelIdByValue,
    onValueChange,
    orientation,
    registerMountedTabPanel,
    setTabMap,
    unregisterMountedTabPanel,
    tabActivationDirection,
    value
  }), [direction, getTabElementBySelectedValue, getTabIdByPanelValue, getTabPanelIdByValue, onValueChange, orientation, registerMountedTabPanel, setTabMap, unregisterMountedTabPanel, tabActivationDirection, value]);
  const selectedTabMetadata = React.useMemo(() => {
    for (const tabMetadata of tabMap.values()) {
      if (tabMetadata != null && tabMetadata.value === value) {
        return tabMetadata;
      }
    }
    return undefined;
  }, [tabMap, value]);

  // Find the first non-disabled tab value.
  // Used as a fallback when the current selection is disabled or missing.
  const firstEnabledTabValue = React.useMemo(() => {
    for (const tabMetadata of tabMap.values()) {
      if (tabMetadata != null && !tabMetadata.disabled) {
        return tabMetadata.value;
      }
    }
    return undefined;
  }, [tabMap]);

  // Automatically switch to the first enabled tab when:
  // - The current selection is disabled (and wasn't explicitly set via defaultValue)
  // - The current selection is missing (tab was removed from DOM)
  // Falls back to null if all tabs are disabled.
  useIsoLayoutEffect(() => {
    if (isControlled || tabMap.size === 0) {
      return;
    }
    const selectionIsDisabled = selectedTabMetadata?.disabled;
    const selectionIsMissing = selectedTabMetadata == null && value !== null;
    const shouldHonorExplicitDefaultSelection = hasExplicitDefaultValueProp && selectionIsDisabled && value === defaultValueProp;
    if (shouldHonorExplicitDefaultSelection) {
      return;
    }
    if (!selectionIsDisabled && !selectionIsMissing) {
      return;
    }
    const fallbackValue = firstEnabledTabValue ?? null;
    if (value === fallbackValue) {
      return;
    }
    setValue(fallbackValue);
    setTabActivationDirection('none');
  }, [defaultValueProp, firstEnabledTabValue, hasExplicitDefaultValueProp, isControlled, selectedTabMetadata, setTabActivationDirection, setValue, tabMap, value]);
  const state = {
    orientation,
    tabActivationDirection
  };
  const element = useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: elementProps,
    stateAttributesMapping: tabsStateAttributesMapping
  });
  return /*#__PURE__*/_jsx(TabsRootContext.Provider, {
    value: tabsContextValue,
    children: /*#__PURE__*/_jsx(CompositeList, {
      elementsRef: tabPanelRefs,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") TabsRoot.displayName = "TabsRoot";