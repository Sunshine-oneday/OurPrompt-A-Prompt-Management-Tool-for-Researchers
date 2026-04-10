"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarButton = void 0;
var React = _interopRequireWildcard(require("react"));
var _useButton = require("../../use-button");
var _ToolbarRootContext = require("../root/ToolbarRootContext");
var _ToolbarGroupContext = require("../group/ToolbarGroupContext");
var _CompositeItem = require("../../composite/item/CompositeItem");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * A button that can be used as-is or as a trigger for other components.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Toolbar](https://base-ui.com/react/components/toolbar)
 */
const ToolbarButton = exports.ToolbarButton = /*#__PURE__*/React.forwardRef(function ToolbarButton(componentProps, forwardedRef) {
  const {
    className,
    disabled: disabledProp = false,
    focusableWhenDisabled = true,
    render,
    nativeButton = true,
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
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
    disabled,
    focusableWhenDisabled,
    native: nativeButton
  });
  const state = {
    disabled,
    orientation,
    focusable: focusableWhenDisabled
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeItem.CompositeItem, {
    tag: "button",
    render: render,
    className: className,
    metadata: itemMetadata,
    state: state,
    refs: [forwardedRef, buttonRef],
    props: [elementProps,
    // for integrating with Menu and Select disabled states, `disabled` is
    // intentionally duplicated even though getButtonProps includes it already
    // TODO: follow up after https://github.com/mui/base-ui/issues/1976#issuecomment-2916905663
    {
      disabled
    }, getButtonProps]
  });
});
if (process.env.NODE_ENV !== "production") ToolbarButton.displayName = "ToolbarButton";