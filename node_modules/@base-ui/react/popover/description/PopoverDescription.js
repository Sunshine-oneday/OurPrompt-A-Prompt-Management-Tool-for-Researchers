"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PopoverDescription = void 0;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _PopoverRootContext = require("../root/PopoverRootContext");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _useRenderElement = require("../../utils/useRenderElement");
/**
 * A paragraph with additional information about the popover.
 * Renders a `<p>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
const PopoverDescription = exports.PopoverDescription = /*#__PURE__*/React.forwardRef(function PopoverDescription(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    store
  } = (0, _PopoverRootContext.usePopoverRootContext)();
  const id = (0, _useBaseUiId.useBaseUiId)(elementProps.id);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    store.set('descriptionElementId', id);
    return () => {
      store.set('descriptionElementId', undefined);
    };
  }, [store, id]);
  const element = (0, _useRenderElement.useRenderElement)('p', componentProps, {
    ref: forwardedRef,
    props: [{
      id
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") PopoverDescription.displayName = "PopoverDescription";