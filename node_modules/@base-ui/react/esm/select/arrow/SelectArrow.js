'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useSelectPositionerContext } from "../positioner/SelectPositionerContext.js";
import { useSelectRootContext } from "../root/SelectRootContext.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { selectors } from "../store.js";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};

/**
 * Displays an element positioned against the select popup anchor.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
export const SelectArrow = /*#__PURE__*/React.forwardRef(function SelectArrow(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useSelectRootContext();
  const {
    side,
    align,
    arrowRef,
    arrowStyles,
    arrowUncentered,
    alignItemWithTriggerActive
  } = useSelectPositionerContext();
  const open = useStore(store, selectors.open, true);
  const state = {
    open,
    side,
    align,
    uncentered: arrowUncentered
  };
  const element = useRenderElement('div', componentProps, {
    state,
    ref: [arrowRef, forwardedRef],
    props: [{
      style: arrowStyles,
      'aria-hidden': true
    }, elementProps],
    stateAttributesMapping
  });
  if (alignItemWithTriggerActive) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") SelectArrow.displayName = "SelectArrow";