"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AlertDialogRoot = AlertDialogRoot;
var React = _interopRequireWildcard(require("react"));
var _useRefWithInit = require("@base-ui/utils/useRefWithInit");
var _useDialogRoot = require("../../dialog/root/useDialogRoot");
var _DialogRootContext = require("../../dialog/root/DialogRootContext");
var _DialogStore = require("../../dialog/store/DialogStore");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups all parts of the alert dialog.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Alert Dialog](https://base-ui.com/react/components/alert-dialog)
 */
function AlertDialogRoot(props) {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    actionsRef,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null
  } = props;
  const parentDialogRootContext = (0, _DialogRootContext.useDialogRootContext)();
  const nested = Boolean(parentDialogRootContext);
  const store = (0, _useRefWithInit.useRefWithInit)(() => {
    return handle?.store ?? new _DialogStore.DialogStore({
      open: defaultOpen,
      openProp,
      activeTriggerId: defaultTriggerIdProp,
      triggerIdProp,
      modal: true,
      disablePointerDismissal: true,
      nested,
      role: 'alertdialog'
    });
  }).current;
  store.useControlledProp('openProp', openProp);
  store.useControlledProp('triggerIdProp', triggerIdProp);
  store.useSyncedValue('nested', nested);
  store.useContextCallback('onOpenChange', onOpenChange);
  store.useContextCallback('onOpenChangeComplete', onOpenChangeComplete);
  const payload = store.useState('payload');
  (0, _useDialogRoot.useDialogRoot)({
    store,
    actionsRef,
    parentContext: parentDialogRootContext?.store.context,
    onOpenChange,
    triggerIdProp
  });
  const contextValue = React.useMemo(() => ({
    store
  }), [store]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_DialogRootContext.DialogRootContext.Provider, {
    value: contextValue,
    children: typeof children === 'function' ? children({
      payload
    }) : children
  });
}