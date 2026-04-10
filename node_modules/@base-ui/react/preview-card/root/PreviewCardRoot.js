"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PreviewCardRoot = PreviewCardRoot;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useOnFirstRender = require("@base-ui/utils/useOnFirstRender");
var _floatingUiReact = require("../../floating-ui-react");
var _PreviewCardContext = require("./PreviewCardContext");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _PreviewCardStore = require("../store/PreviewCardStore");
var _popups = require("../../utils/popups");
var _jsxRuntime = require("react/jsx-runtime");
function PreviewCardRootComponent(props) {
  const {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    actionsRef,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null,
    children
  } = props;
  const store = _PreviewCardStore.PreviewCardStore.useStore(handle?.store, {
    open: defaultOpen,
    openProp,
    activeTriggerId: defaultTriggerIdProp,
    triggerIdProp
  });

  // Support initially open state when uncontrolled
  (0, _useOnFirstRender.useOnFirstRender)(() => {
    if (openProp === undefined && store.state.open === false && defaultOpen === true) {
      store.update({
        open: true,
        activeTriggerId: defaultTriggerIdProp
      });
    }
  });
  store.useControlledProp('openProp', openProp);
  store.useControlledProp('triggerIdProp', triggerIdProp);
  store.useContextCallback('onOpenChange', onOpenChange);
  store.useContextCallback('onOpenChangeComplete', onOpenChangeComplete);
  const open = store.useState('open');
  const activeTriggerId = store.useState('activeTriggerId');
  const payload = store.useState('payload');
  (0, _popups.useImplicitActiveTrigger)(store);
  const {
    forceUnmount
  } = (0, _popups.useOpenStateTransitions)(open, store);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (open) {
      if (activeTriggerId == null) {
        store.set('payload', undefined);
      }
    }
  }, [store, activeTriggerId, open]);
  const handleImperativeClose = React.useCallback(() => {
    store.setOpen(false, createPreviewCardEventDetails(store, _reasons.REASONS.imperativeAction));
  }, [store]);
  React.useImperativeHandle(actionsRef, () => ({
    unmount: forceUnmount,
    close: handleImperativeClose
  }), [forceUnmount, handleImperativeClose]);
  const floatingRootContext = store.useState('floatingRootContext');
  const dismiss = (0, _floatingUiReact.useDismiss)(floatingRootContext);
  const {
    getReferenceProps,
    getTriggerProps,
    getFloatingProps
  } = (0, _floatingUiReact.useInteractions)([dismiss]);
  const activeTriggerProps = React.useMemo(() => getReferenceProps(), [getReferenceProps]);
  const inactiveTriggerProps = React.useMemo(() => getTriggerProps(), [getTriggerProps]);
  const popupProps = React.useMemo(() => getFloatingProps(), [getFloatingProps]);
  store.useSyncedValues({
    activeTriggerProps,
    inactiveTriggerProps,
    popupProps
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_PreviewCardContext.PreviewCardRootContext.Provider, {
    value: store,
    children: typeof children === 'function' ? children({
      payload
    }) : children
  });
}

/**
 * Groups all parts of the preview card.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Preview Card](https://base-ui.com/react/components/preview-card)
 */
function PreviewCardRoot(props) {
  if ((0, _PreviewCardContext.usePreviewCardRootContext)(true)) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(PreviewCardRootComponent, {
      ...props
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_floatingUiReact.FloatingTree, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(PreviewCardRootComponent, {
      ...props
    })
  });
}
function createPreviewCardEventDetails(store, reason) {
  const details = (0, _createBaseUIEventDetails.createChangeEventDetails)(reason);
  details.preventUnmountOnClose = () => {
    store.set('preventUnmountingOnClose', true);
  };
  return details;
}