'use client';

import * as React from 'react';
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext.js";
import { ScrollAreaScrollbarContext } from "./ScrollAreaScrollbarContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { getOffset } from "../utils/getOffset.js";
import { ScrollAreaRootCssVars } from "../root/ScrollAreaRootCssVars.js";
import { ScrollAreaScrollbarCssVars } from "./ScrollAreaScrollbarCssVars.js";
import { useDirection } from "../../direction-provider/DirectionContext.js";
import { scrollAreaStateAttributesMapping } from "../root/stateAttributes.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A vertical or horizontal scrollbar for the scroll area.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
 */
export const ScrollAreaScrollbar = /*#__PURE__*/React.forwardRef(function ScrollAreaScrollbar(componentProps, forwardedRef) {
  const {
    render,
    className,
    orientation = 'vertical',
    keepMounted = false,
    ...elementProps
  } = componentProps;
  const {
    hovering,
    scrollingX,
    scrollingY,
    hiddenState,
    overflowEdges,
    scrollbarYRef,
    scrollbarXRef,
    viewportRef,
    thumbYRef,
    thumbXRef,
    handlePointerDown,
    handlePointerUp,
    rootId,
    thumbSize,
    hasMeasuredScrollbar
  } = useScrollAreaRootContext();
  const state = {
    hovering,
    scrolling: {
      horizontal: scrollingX,
      vertical: scrollingY
    }[orientation],
    orientation,
    hasOverflowX: !hiddenState.x,
    hasOverflowY: !hiddenState.y,
    overflowXStart: overflowEdges.xStart,
    overflowXEnd: overflowEdges.xEnd,
    overflowYStart: overflowEdges.yStart,
    overflowYEnd: overflowEdges.yEnd,
    cornerHidden: hiddenState.corner
  };
  const direction = useDirection();
  const hideTrackUntilMeasured = !hasMeasuredScrollbar && !keepMounted;
  React.useEffect(() => {
    const viewportEl = viewportRef.current;
    const scrollbarEl = orientation === 'vertical' ? scrollbarYRef.current : scrollbarXRef.current;
    if (!scrollbarEl) {
      return undefined;
    }
    function handleWheel(event) {
      if (!viewportEl || !scrollbarEl || event.ctrlKey) {
        return;
      }
      event.preventDefault();
      if (orientation === 'vertical') {
        if (viewportEl.scrollTop === 0 && event.deltaY < 0) {
          return;
        }
      } else if (viewportEl.scrollLeft === 0 && event.deltaX < 0) {
        return;
      }
      if (orientation === 'vertical') {
        if (viewportEl.scrollTop === viewportEl.scrollHeight - viewportEl.clientHeight && event.deltaY > 0) {
          return;
        }
      } else if (viewportEl.scrollLeft === viewportEl.scrollWidth - viewportEl.clientWidth && event.deltaX > 0) {
        return;
      }
      if (orientation === 'vertical') {
        viewportEl.scrollTop += event.deltaY;
      } else {
        viewportEl.scrollLeft += event.deltaX;
      }
    }
    scrollbarEl.addEventListener('wheel', handleWheel, {
      passive: false
    });
    return () => {
      scrollbarEl.removeEventListener('wheel', handleWheel);
    };
  }, [orientation, scrollbarXRef, scrollbarYRef, viewportRef]);
  const props = {
    ...(rootId && {
      'data-id': `${rootId}-scrollbar`
    }),
    onPointerDown(event) {
      if (event.button !== 0) {
        return;
      }

      // Ignore clicks on thumb
      if (event.currentTarget !== event.target) {
        return;
      }
      if (!viewportRef.current) {
        return;
      }

      // Handle Y-axis (vertical) scroll
      if (thumbYRef.current && scrollbarYRef.current && orientation === 'vertical') {
        const thumbYOffset = getOffset(thumbYRef.current, 'margin', 'y');
        const scrollbarYOffset = getOffset(scrollbarYRef.current, 'padding', 'y');
        const thumbHeight = thumbYRef.current.offsetHeight;
        const trackRectY = scrollbarYRef.current.getBoundingClientRect();
        const clickY = event.clientY - trackRectY.top - thumbHeight / 2 - scrollbarYOffset + thumbYOffset / 2;
        const scrollableContentHeight = viewportRef.current.scrollHeight;
        const viewportHeight = viewportRef.current.clientHeight;
        const maxThumbOffsetY = scrollbarYRef.current.offsetHeight - thumbHeight - scrollbarYOffset - thumbYOffset;
        const scrollRatioY = clickY / maxThumbOffsetY;
        const newScrollTop = scrollRatioY * (scrollableContentHeight - viewportHeight);
        viewportRef.current.scrollTop = newScrollTop;
      }
      if (thumbXRef.current && scrollbarXRef.current && orientation === 'horizontal') {
        const thumbXOffset = getOffset(thumbXRef.current, 'margin', 'x');
        const scrollbarXOffset = getOffset(scrollbarXRef.current, 'padding', 'x');
        const thumbWidth = thumbXRef.current.offsetWidth;
        const trackRectX = scrollbarXRef.current.getBoundingClientRect();
        const clickX = event.clientX - trackRectX.left - thumbWidth / 2 - scrollbarXOffset + thumbXOffset / 2;
        const scrollableContentWidth = viewportRef.current.scrollWidth;
        const viewportWidth = viewportRef.current.clientWidth;
        const maxThumbOffsetX = scrollbarXRef.current.offsetWidth - thumbWidth - scrollbarXOffset - thumbXOffset;
        const scrollRatioX = clickX / maxThumbOffsetX;
        let newScrollLeft;
        if (direction === 'rtl') {
          // In RTL, invert the scroll direction
          newScrollLeft = (1 - scrollRatioX) * (scrollableContentWidth - viewportWidth);

          // Adjust for browsers that use negative scrollLeft in RTL
          if (viewportRef.current.scrollLeft <= 0) {
            newScrollLeft = -newScrollLeft;
          }
        } else {
          newScrollLeft = scrollRatioX * (scrollableContentWidth - viewportWidth);
        }
        viewportRef.current.scrollLeft = newScrollLeft;
      }
      handlePointerDown(event);
    },
    onPointerUp: handlePointerUp,
    style: {
      position: 'absolute',
      touchAction: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      visibility: hideTrackUntilMeasured ? 'hidden' : undefined,
      ...(orientation === 'vertical' && {
        top: 0,
        bottom: `var(${ScrollAreaRootCssVars.scrollAreaCornerHeight})`,
        insetInlineEnd: 0,
        [ScrollAreaScrollbarCssVars.scrollAreaThumbHeight]: `${thumbSize.height}px`
      }),
      ...(orientation === 'horizontal' && {
        insetInlineStart: 0,
        insetInlineEnd: `var(${ScrollAreaRootCssVars.scrollAreaCornerWidth})`,
        bottom: 0,
        [ScrollAreaScrollbarCssVars.scrollAreaThumbWidth]: `${thumbSize.width}px`
      })
    }
  };
  const element = useRenderElement('div', componentProps, {
    ref: [forwardedRef, orientation === 'vertical' ? scrollbarYRef : scrollbarXRef],
    state,
    props: [props, elementProps],
    stateAttributesMapping: scrollAreaStateAttributesMapping
  });
  const contextValue = React.useMemo(() => ({
    orientation
  }), [orientation]);
  const isHidden = orientation === 'vertical' ? hiddenState.y : hiddenState.x;
  const shouldRender = keepMounted || !isHidden;
  if (!shouldRender) {
    return null;
  }
  return /*#__PURE__*/_jsx(ScrollAreaScrollbarContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ScrollAreaScrollbar.displayName = "ScrollAreaScrollbar";