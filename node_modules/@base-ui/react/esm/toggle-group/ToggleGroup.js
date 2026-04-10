'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useControlled } from '@base-ui/utils/useControlled';
import { useRenderElement } from "../utils/useRenderElement.js";
import { CompositeRoot } from "../composite/root/CompositeRoot.js";
import { useToolbarRootContext } from "../toolbar/root/ToolbarRootContext.js";
import { ToggleGroupContext } from "./ToggleGroupContext.js";
import { ToggleGroupDataAttributes } from "./ToggleGroupDataAttributes.js";
import { jsx as _jsx } from "react/jsx-runtime";
const stateAttributesMapping = {
  multiple(value) {
    if (value) {
      return {
        [ToggleGroupDataAttributes.multiple]: ''
      };
    }
    return null;
  }
};

/**
 * Provides a shared state to a series of toggle buttons.
 *
 * Documentation: [Base UI Toggle Group](https://base-ui.com/react/components/toggle-group)
 */
export const ToggleGroup = /*#__PURE__*/React.forwardRef(function ToggleGroup(componentProps, forwardedRef) {
  const {
    defaultValue: defaultValueProp,
    disabled: disabledProp = false,
    loopFocus = true,
    onValueChange,
    orientation = 'horizontal',
    multiple = false,
    value: valueProp,
    className,
    render,
    ...elementProps
  } = componentProps;
  const toolbarContext = useToolbarRootContext(true);
  const defaultValue = React.useMemo(() => {
    if (valueProp === undefined) {
      return defaultValueProp ?? [];
    }
    return undefined;
  }, [valueProp, defaultValueProp]);
  const isValueInitialized = React.useMemo(() => valueProp !== undefined || defaultValueProp !== undefined, [valueProp, defaultValueProp]);
  const disabled = (toolbarContext?.disabled ?? false) || disabledProp;
  const [groupValue, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'ToggleGroup',
    state: 'value'
  });
  const setGroupValue = useStableCallback((newValue, nextPressed, eventDetails) => {
    let newGroupValue;
    if (multiple) {
      newGroupValue = groupValue.slice();
      if (nextPressed) {
        newGroupValue.push(newValue);
      } else {
        newGroupValue.splice(groupValue.indexOf(newValue), 1);
      }
    } else {
      newGroupValue = nextPressed ? [newValue] : [];
    }
    if (Array.isArray(newGroupValue)) {
      onValueChange?.(newGroupValue, eventDetails);
      if (eventDetails.isCanceled) {
        return;
      }
      setValueState(newGroupValue);
    }
  });
  const state = {
    disabled,
    multiple,
    orientation
  };
  const contextValue = React.useMemo(() => ({
    disabled,
    orientation,
    setGroupValue,
    value: groupValue,
    isValueInitialized
  }), [disabled, orientation, setGroupValue, groupValue, isValueInitialized]);
  const defaultProps = {
    role: 'group'
  };
  const element = useRenderElement('div', componentProps, {
    enabled: Boolean(toolbarContext),
    state,
    ref: forwardedRef,
    props: [defaultProps, elementProps],
    stateAttributesMapping
  });
  return /*#__PURE__*/_jsx(ToggleGroupContext.Provider, {
    value: contextValue,
    children: toolbarContext ? element : /*#__PURE__*/_jsx(CompositeRoot, {
      render: render,
      className: className,
      state: state,
      refs: [forwardedRef],
      props: [defaultProps, elementProps],
      stateAttributesMapping: stateAttributesMapping,
      loopFocus: loopFocus,
      enableHomeAndEndKeys: true
    })
  });
});
if (process.env.NODE_ENV !== "production") ToggleGroup.displayName = "ToggleGroup";