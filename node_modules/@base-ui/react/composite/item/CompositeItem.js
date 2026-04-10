"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CompositeItem = CompositeItem;
var _useRenderElement = require("../../utils/useRenderElement");
var _useCompositeItem = require("./useCompositeItem");
var _constants = require("../../utils/constants");
/**
 * @internal
 */
function CompositeItem(componentProps) {
  const {
    render,
    className,
    state = _constants.EMPTY_OBJECT,
    props = _constants.EMPTY_ARRAY,
    refs = _constants.EMPTY_ARRAY,
    metadata,
    stateAttributesMapping,
    tag = 'div',
    ...elementProps
  } = componentProps;
  const {
    compositeProps,
    compositeRef
  } = (0, _useCompositeItem.useCompositeItem)({
    metadata
  });
  return (0, _useRenderElement.useRenderElement)(tag, componentProps, {
    state,
    ref: [...refs, compositeRef],
    props: [compositeProps, ...props, elementProps],
    stateAttributesMapping
  });
}