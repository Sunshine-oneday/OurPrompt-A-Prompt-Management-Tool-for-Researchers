"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectItemText = void 0;
var React = _interopRequireWildcard(require("react"));
var _SelectRootContext = require("../root/SelectRootContext");
var _SelectItemContext = require("../item/SelectItemContext");
var _useRenderElement = require("../../utils/useRenderElement");
/**
 * A text label of the select item.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
const SelectItemText = exports.SelectItemText = /*#__PURE__*/React.memo(/*#__PURE__*/React.forwardRef(function SelectItemText(componentProps, forwardedRef) {
  const {
    indexRef,
    textRef,
    selectedByFocus,
    hasRegistered
  } = (0, _SelectItemContext.useSelectItemContext)();
  const {
    selectedItemTextRef
  } = (0, _SelectRootContext.useSelectRootContext)();
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const localRef = React.useCallback(node => {
    if (!node || !hasRegistered) {
      return;
    }
    const hasNoSelectedItemText = selectedItemTextRef.current === null || !selectedItemTextRef.current.isConnected;
    if (selectedByFocus || hasNoSelectedItemText && indexRef.current === 0) {
      selectedItemTextRef.current = node;
    }
  }, [selectedItemTextRef, indexRef, selectedByFocus, hasRegistered]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [localRef, forwardedRef, textRef],
    props: elementProps
  });
  return element;
}));
if (process.env.NODE_ENV !== "production") SelectItemText.displayName = "SelectItemText";