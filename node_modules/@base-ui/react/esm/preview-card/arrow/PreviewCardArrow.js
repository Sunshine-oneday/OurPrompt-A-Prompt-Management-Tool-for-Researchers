'use client';

import * as React from 'react';
import { usePreviewCardPositionerContext } from "../positioner/PreviewCardPositionerContext.js";
import { usePreviewCardRootContext } from "../root/PreviewCardContext.js";
import { popupStateMapping } from "../../utils/popupStateMapping.js";
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * Displays an element positioned against the preview card anchor.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Preview Card](https://base-ui.com/react/components/preview-card)
 */
export const PreviewCardArrow = /*#__PURE__*/React.forwardRef(function PreviewCardArrow(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const store = usePreviewCardRootContext();
  const {
    arrowRef,
    side,
    align,
    arrowUncentered,
    arrowStyles
  } = usePreviewCardPositionerContext();
  const open = store.useState('open');
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
    stateAttributesMapping: popupStateMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") PreviewCardArrow.displayName = "PreviewCardArrow";