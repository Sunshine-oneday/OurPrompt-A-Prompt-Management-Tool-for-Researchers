"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DialogClose = void 0;
var React = _interopRequireWildcard(require("react"));
var _DialogRootContext = require("../root/DialogRootContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _useButton = require("../../use-button");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
/**
 * A button that closes the dialog.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
 */
const DialogClose = exports.DialogClose = /*#__PURE__*/React.forwardRef(function DialogClose(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    store
  } = (0, _DialogRootContext.useDialogRootContext)();
  const open = store.useState('open');
  function handleClick(event) {
    if (open) {
      store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.closePress, event.nativeEvent));
    }
  }
  const {
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
    disabled,
    native: nativeButton
  });
  const state = {
    disabled
  };
  return (0, _useRenderElement.useRenderElement)('button', componentProps, {
    state,
    ref: [forwardedRef, buttonRef],
    props: [{
      onClick: handleClick
    }, elementProps, getButtonProps]
  });
});
if (process.env.NODE_ENV !== "production") DialogClose.displayName = "DialogClose";