"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarInput = void 0;
var React = _interopRequireWildcard(require("react"));
var _useFocusableWhenDisabled = require("../../utils/useFocusableWhenDisabled");
var _composite = require("../../composite/composite");
var _ToolbarRootContext = require("../root/ToolbarRootContext");
var _ToolbarGroupContext = require("../group/ToolbarGroupContext");
var _CompositeItem = require("../../composite/item/CompositeItem");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * A native input element that integrates with Toolbar keyboard navigation.
 * Renders an `<input>` element.
 *
 * Documentation: [Base UI Toolbar](https://base-ui.com/react/components/toolbar)
 */
const ToolbarInput = exports.ToolbarInput = /*#__PURE__*/React.forwardRef(function ToolbarInput(componentProps, forwardedRef) {
  const {
    className,
    focusableWhenDisabled = true,
    render,
    disabled: disabledProp = false,
    ...elementProps
  } = componentProps;
  const itemMetadata = React.useMemo(() => ({
    focusableWhenDisabled
  }), [focusableWhenDisabled]);
  const {
    disabled: toolbarDisabled,
    orientation
  } = (0, _ToolbarRootContext.useToolbarRootContext)();
  const groupContext = (0, _ToolbarGroupContext.useToolbarGroupContext)(true);
  const disabled = toolbarDisabled || (groupContext?.disabled ?? false) || disabledProp;
  const {
    props: focusableWhenDisabledProps
  } = (0, _useFocusableWhenDisabled.useFocusableWhenDisabled)({
    composite: true,
    disabled,
    focusableWhenDisabled,
    isNativeButton: false
  });
  const state = {
    disabled,
    orientation,
    focusable: focusableWhenDisabled
  };
  const defaultProps = {
    onClick(event) {
      if (disabled) {
        event.preventDefault();
      }
    },
    onKeyDown(event) {
      if (event.key !== _composite.ARROW_LEFT && event.key !== _composite.ARROW_RIGHT && disabled) {
        (0, _composite.stopEvent)(event);
      }
    },
    onPointerDown(event) {
      if (disabled) {
        event.preventDefault();
      }
    }
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeItem.CompositeItem, {
    tag: "input",
    render: render,
    className: className,
    metadata: itemMetadata,
    state: state,
    refs: [forwardedRef],
    props: [defaultProps, elementProps, focusableWhenDisabledProps]
  });
});
if (process.env.NODE_ENV !== "production") ToolbarInput.displayName = "ToolbarInput";