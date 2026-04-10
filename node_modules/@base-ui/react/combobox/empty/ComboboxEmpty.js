"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxEmpty = void 0;
var React = _interopRequireWildcard(require("react"));
var _useRenderElement = require("../../utils/useRenderElement");
var _ComboboxRootContext = require("../root/ComboboxRootContext");
/**
 * Renders its children only when the list is empty.
 * Requires the `items` prop on the root component.
 * Announces changes politely to screen readers.
 * Renders a `<div>` element.
 */
const ComboboxEmpty = exports.ComboboxEmpty = /*#__PURE__*/React.forwardRef(function ComboboxEmpty(componentProps, forwardedRef) {
  const {
    render,
    className,
    children: childrenProp,
    ...elementProps
  } = componentProps;
  const {
    filteredItems
  } = (0, _ComboboxRootContext.useComboboxDerivedItemsContext)();
  const store = (0, _ComboboxRootContext.useComboboxRootContext)();
  const children = filteredItems.length === 0 ? childrenProp : null;
  return (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [forwardedRef, store.state.emptyRef],
    props: [{
      children,
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true
    }, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") ComboboxEmpty.displayName = "ComboboxEmpty";