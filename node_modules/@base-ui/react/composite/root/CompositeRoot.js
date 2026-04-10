"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CompositeRoot = CompositeRoot;
var React = _interopRequireWildcard(require("react"));
var _CompositeList = require("../list/CompositeList");
var _useCompositeRoot = require("./useCompositeRoot");
var _CompositeRootContext = require("./CompositeRootContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _DirectionContext = require("../../direction-provider/DirectionContext");
var _constants = require("../../utils/constants");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * @internal
 */
function CompositeRoot(componentProps) {
  const {
    render,
    className,
    refs = _constants.EMPTY_ARRAY,
    props = _constants.EMPTY_ARRAY,
    state = _constants.EMPTY_OBJECT,
    stateAttributesMapping,
    highlightedIndex: highlightedIndexProp,
    onHighlightedIndexChange: onHighlightedIndexChangeProp,
    orientation,
    dense,
    itemSizes,
    loopFocus,
    cols,
    enableHomeAndEndKeys,
    onMapChange: onMapChangeProp,
    stopEventPropagation = true,
    rootRef,
    disabledIndices,
    modifierKeys,
    highlightItemOnHover = false,
    tag = 'div',
    ...elementProps
  } = componentProps;
  const direction = (0, _DirectionContext.useDirection)();
  const {
    props: defaultProps,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    onMapChange: onMapChangeUnwrapped,
    relayKeyboardEvent
  } = (0, _useCompositeRoot.useCompositeRoot)({
    itemSizes,
    cols,
    loopFocus,
    dense,
    orientation,
    highlightedIndex: highlightedIndexProp,
    onHighlightedIndexChange: onHighlightedIndexChangeProp,
    rootRef,
    stopEventPropagation,
    enableHomeAndEndKeys,
    direction,
    disabledIndices,
    modifierKeys
  });
  const element = (0, _useRenderElement.useRenderElement)(tag, componentProps, {
    state,
    ref: refs,
    props: [defaultProps, ...props, elementProps],
    stateAttributesMapping
  });
  const contextValue = React.useMemo(() => ({
    highlightedIndex,
    onHighlightedIndexChange,
    highlightItemOnHover,
    relayKeyboardEvent
  }), [highlightedIndex, onHighlightedIndexChange, highlightItemOnHover, relayKeyboardEvent]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeRootContext.CompositeRootContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeList.CompositeList, {
      elementsRef: elementsRef,
      onMapChange: newMap => {
        onMapChangeProp?.(newMap);
        onMapChangeUnwrapped(newMap);
      },
      children: element
    })
  });
}