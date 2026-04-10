'use client';

import * as React from 'react';
import { useCheckboxRootContext } from "../root/CheckboxRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useStateAttributesMapping } from "../utils/useStateAttributesMapping.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { useTransitionStatus } from "../../utils/useTransitionStatus.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { fieldValidityMapping } from "../../field/utils/constants.js";

/**
 * Indicates whether the checkbox is ticked.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Checkbox](https://base-ui.com/react/components/checkbox)
 */
export const CheckboxIndicator = /*#__PURE__*/React.forwardRef(function CheckboxIndicator(componentProps, forwardedRef) {
  const {
    render,
    className,
    keepMounted = false,
    ...elementProps
  } = componentProps;
  const rootState = useCheckboxRootContext();
  const rendered = rootState.checked || rootState.indeterminate;
  const {
    mounted,
    transitionStatus,
    setMounted
  } = useTransitionStatus(rendered);
  const indicatorRef = React.useRef(null);
  const state = {
    ...rootState,
    transitionStatus
  };
  useOpenChangeComplete({
    open: rendered,
    ref: indicatorRef,
    onComplete() {
      if (!rendered) {
        setMounted(false);
      }
    }
  });
  const baseStateAttributesMapping = useStateAttributesMapping(rootState);
  const stateAttributesMapping = React.useMemo(() => ({
    ...baseStateAttributesMapping,
    ...transitionStatusMapping,
    ...fieldValidityMapping
  }), [baseStateAttributesMapping]);
  const shouldRender = keepMounted || mounted;
  const element = useRenderElement('span', componentProps, {
    ref: [forwardedRef, indicatorRef],
    state,
    stateAttributesMapping,
    props: elementProps
  });
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") CheckboxIndicator.displayName = "CheckboxIndicator";