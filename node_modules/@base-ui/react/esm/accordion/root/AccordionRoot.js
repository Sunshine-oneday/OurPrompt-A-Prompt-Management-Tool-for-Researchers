'use client';

import * as React from 'react';
import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { warn } from '@base-ui/utils/warn';
import { CompositeList } from "../../composite/list/CompositeList.js";
import { useDirection } from "../../direction-provider/DirectionContext.js";
import { AccordionRootContext } from "./AccordionRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { jsx as _jsx } from "react/jsx-runtime";
const rootStateAttributesMapping = {
  value: () => null
};

/**
 * Groups all parts of the accordion.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */
export const AccordionRoot = /*#__PURE__*/React.forwardRef(function AccordionRoot(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    loopFocus = true,
    onValueChange: onValueChangeProp,
    multiple = false,
    orientation = 'vertical',
    value: valueProp,
    defaultValue: defaultValueProp,
    ...elementProps
  } = componentProps;
  const direction = useDirection();
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useIsoLayoutEffect(() => {
      if (hiddenUntilFoundProp && keepMountedProp === false) {
        warn('The `keepMounted={false}` prop on a Accordion.Root will be ignored when using `hiddenUntilFound` since it requires Panels to remain mounted when closed.');
      }
    }, [hiddenUntilFoundProp, keepMountedProp]);
  }

  // memoized to allow omitting both defaultValue and value
  // which would otherwise trigger a warning in useControlled
  const defaultValue = React.useMemo(() => {
    if (valueProp === undefined) {
      return defaultValueProp ?? [];
    }
    return undefined;
  }, [valueProp, defaultValueProp]);
  const onValueChange = useStableCallback(onValueChangeProp);
  const accordionItemRefs = React.useRef([]);
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'Accordion',
    state: 'value'
  });
  const handleValueChange = useStableCallback((newValue, nextOpen) => {
    const details = createChangeEventDetails(REASONS.none);
    if (!multiple) {
      const nextValue = value[0] === newValue ? [] : [newValue];
      onValueChange(nextValue, details);
      if (details.isCanceled) {
        return;
      }
      setValue(nextValue);
    } else if (nextOpen) {
      const nextOpenValues = value.slice();
      nextOpenValues.push(newValue);
      onValueChange(nextOpenValues, details);
      if (details.isCanceled) {
        return;
      }
      setValue(nextOpenValues);
    } else {
      const nextOpenValues = value.filter(v => v !== newValue);
      onValueChange(nextOpenValues, details);
      if (details.isCanceled) {
        return;
      }
      setValue(nextOpenValues);
    }
  });
  const state = React.useMemo(() => ({
    value,
    disabled,
    orientation
  }), [value, disabled, orientation]);
  const contextValue = React.useMemo(() => ({
    accordionItemRefs,
    direction,
    disabled,
    handleValueChange,
    hiddenUntilFound: hiddenUntilFoundProp ?? false,
    keepMounted: keepMountedProp ?? false,
    loopFocus,
    orientation,
    state,
    value
  }), [direction, disabled, handleValueChange, hiddenUntilFoundProp, keepMountedProp, loopFocus, orientation, state, value]);
  const element = useRenderElement('div', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      dir: direction,
      role: 'region'
    }, elementProps],
    stateAttributesMapping: rootStateAttributesMapping
  });
  return /*#__PURE__*/_jsx(AccordionRootContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(CompositeList, {
      elementsRef: accordionItemRefs,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") AccordionRoot.displayName = "AccordionRoot";