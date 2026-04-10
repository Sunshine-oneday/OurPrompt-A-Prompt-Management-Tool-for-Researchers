'use client';

import * as React from 'react';
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext.js";
import { useScrollAreaScrollbarContext } from "../scrollbar/ScrollAreaScrollbarContext.js";
import { ScrollAreaScrollbarCssVars } from "../scrollbar/ScrollAreaScrollbarCssVars.js";
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * The draggable part of the scrollbar that indicates the current scroll position.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
 */
export const ScrollAreaThumb = /*#__PURE__*/React.forwardRef(function ScrollAreaThumb(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    thumbYRef,
    thumbXRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    setScrollingX,
    setScrollingY,
    hasMeasuredScrollbar
  } = useScrollAreaRootContext();
  const {
    orientation
  } = useScrollAreaScrollbarContext();
  const state = {
    orientation
  };
  const element = useRenderElement('div', componentProps, {
    ref: [forwardedRef, orientation === 'vertical' ? thumbYRef : thumbXRef],
    state,
    props: [{
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp(event) {
        if (orientation === 'vertical') {
          setScrollingY(false);
        }
        if (orientation === 'horizontal') {
          setScrollingX(false);
        }
        handlePointerUp(event);
      },
      style: {
        visibility: hasMeasuredScrollbar ? undefined : 'hidden',
        ...(orientation === 'vertical' && {
          height: `var(${ScrollAreaScrollbarCssVars.scrollAreaThumbHeight})`
        }),
        ...(orientation === 'horizontal' && {
          width: `var(${ScrollAreaScrollbarCssVars.scrollAreaThumbWidth})`
        })
      }
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") ScrollAreaThumb.displayName = "ScrollAreaThumb";