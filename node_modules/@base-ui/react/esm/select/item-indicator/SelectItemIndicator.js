'use client';

import * as React from 'react';
import { useSelectItemContext } from "../item/SelectItemContext.js";
import { useTransitionStatus } from "../../utils/useTransitionStatus.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";

/**
 * Indicates whether the select item is selected.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const SelectItemIndicator = /*#__PURE__*/React.forwardRef(function SelectItemIndicator(componentProps, forwardedRef) {
  const keepMounted = componentProps.keepMounted ?? false;
  const {
    selected
  } = useSelectItemContext();
  const shouldRender = keepMounted || selected;
  if (!shouldRender) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return /*#__PURE__*/_jsx(Inner, {
    ...componentProps,
    ref: forwardedRef
  });
});

/** The core implementation of the indicator is split here to avoid paying the hooks
 * costs unless the element needs to be mounted. */
if (process.env.NODE_ENV !== "production") SelectItemIndicator.displayName = "SelectItemIndicator";
const Inner = /*#__PURE__*/React.memo(/*#__PURE__*/React.forwardRef((componentProps, forwardedRef) => {
  const {
    render,
    className,
    keepMounted,
    ...elementProps
  } = componentProps;
  const {
    selected
  } = useSelectItemContext();
  const indicatorRef = React.useRef(null);
  const {
    transitionStatus,
    setMounted
  } = useTransitionStatus(selected);
  const state = {
    selected,
    transitionStatus
  };
  const element = useRenderElement('span', componentProps, {
    ref: [forwardedRef, indicatorRef],
    state,
    props: [{
      'aria-hidden': true,
      children: '✔️'
    }, elementProps],
    stateAttributesMapping: transitionStatusMapping
  });
  useOpenChangeComplete({
    open: selected,
    ref: indicatorRef,
    onComplete() {
      if (!selected) {
        setMounted(false);
      }
    }
  });
  return element;
}));
if (process.env.NODE_ENV !== "production") Inner.displayName = "Inner";