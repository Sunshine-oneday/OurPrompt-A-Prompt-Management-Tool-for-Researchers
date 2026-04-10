"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ScrollAreaContent = void 0;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _ScrollAreaViewportContext = require("../viewport/ScrollAreaViewportContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _ScrollAreaRootContext = require("../root/ScrollAreaRootContext");
var _stateAttributes = require("../root/stateAttributes");
/**
 * A container for the content of the scroll area.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://base-ui.com/react/components/scroll-area)
 */
const ScrollAreaContent = exports.ScrollAreaContent = /*#__PURE__*/React.forwardRef(function ScrollAreaContent(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const contentWrapperRef = React.useRef(null);
  const {
    computeThumbPosition
  } = (0, _ScrollAreaViewportContext.useScrollAreaViewportContext)();
  const {
    viewportState
  } = (0, _ScrollAreaRootContext.useScrollAreaRootContext)();
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    let hasInitialized = false;
    const ro = new ResizeObserver(() => {
      // ResizeObserver fires once upon observing, so we skip the initial call
      // to avoid double-calculating the thumb position on mount.
      if (!hasInitialized) {
        hasInitialized = true;
        return;
      }
      computeThumbPosition();
    });
    if (contentWrapperRef.current) {
      ro.observe(contentWrapperRef.current);
    }
    return () => {
      ro.disconnect();
    };
  }, [computeThumbPosition]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [forwardedRef, contentWrapperRef],
    state: viewportState,
    stateAttributesMapping: _stateAttributes.scrollAreaStateAttributesMapping,
    props: [{
      role: 'presentation',
      style: {
        minWidth: 'fit-content'
      }
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") ScrollAreaContent.displayName = "ScrollAreaContent";