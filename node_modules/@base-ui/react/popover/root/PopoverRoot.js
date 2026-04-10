"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PopoverRoot = PopoverRoot;
var React = _interopRequireWildcard(require("react"));
var _useScrollLock = require("@base-ui/utils/useScrollLock");
var _useOnFirstRender = require("@base-ui/utils/useOnFirstRender");
var _floatingUiReact = require("../../floating-ui-react");
var _PopoverRootContext = require("./PopoverRootContext");
var _PopoverStore = require("../store/PopoverStore");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _popups = require("../../utils/popups");
var _useOpenInteractionType = require("../../utils/useOpenInteractionType");
var _jsxRuntime = require("react/jsx-runtime");
function PopoverRootComponent({
  props
}) {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    onOpenChangeComplete,
    modal = false,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null
  } = props;
  const store = _PopoverStore.PopoverStore.useStore(handle?.store, {
    modal,
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
  const open = store.useState('open');
  const positionerElement = store.useState('positionerElement');
  const payload = store.useState('payload');
  const openReason = store.useState('openChangeReason');
  store.useContextCallback('onOpenChange', onOpenChange);
  store.useContextCallback('onOpenChangeComplete', onOpenChangeComplete);
  const {
    openMethod,
    triggerProps: interactionTypeTriggerProps
  } = (0, _useOpenInteractionType.useOpenInteractionType)(open);
  (0, _popups.useImplicitActiveTrigger)(store);
  const {
    forceUnmount
  } = (0, _popups.useOpenStateTransitions)(open, store, () => {
    store.update({
      stickIfOpen: true,
      openChangeReason: null
    });
  });
  (0, _useScrollLock.useScrollLock)(open && modal === true && openReason !== _reasons.REASONS.triggerHover && openMethod !== 'touch', positionerElement);
  React.useEffect(() => {
    if (!open) {
      store.context.stickIfOpenTimeout.clear();
    }
  }, [store, open]);
  const createPopoverEventDetails = React.useCallback(reason => {
    const details = (0, _createBaseUIEventDetails.createChangeEventDetails)(reason);
    details.preventUnmountOnClose = () => {
      store.set('preventUnmountingOnClose', true);
    };
    return details;
  }, [store]);
  const handleImperativeClose = React.useCallback(() => {
    store.setOpen(false, createPopoverEventDetails(_reasons.REASONS.imperativeAction));
  }, [store, createPopoverEventDetails]);
  React.useImperativeHandle(props.actionsRef, () => ({
    unmount: forceUnmount,
    close: handleImperativeClose
  }), [forceUnmount, handleImperativeClose]);
  const floatingRootContext = (0, _floatingUiReact.useSyncedFloatingRootContext)({
    popupStore: store,
    onOpenChange: store.setOpen
  });
  const dismiss = (0, _floatingUiReact.useDismiss)(floatingRootContext, {
    outsidePressEvent: {
      // Ensure `aria-hidden` on outside elements is removed immediately
      // on outside press when trapping focus.
      mouse: modal === 'trap-focus' ? 'sloppy' : 'intentional',
      touch: 'sloppy'
    }
  });
  const role = (0, _floatingUiReact.useRole)(floatingRootContext);
  const {
    getReferenceProps,
    getFloatingProps,
    getTriggerProps
  } = (0, _floatingUiReact.useInteractions)([dismiss, role]);
  const activeTriggerProps = React.useMemo(() => {
    return getReferenceProps(interactionTypeTriggerProps);
  }, [getReferenceProps, interactionTypeTriggerProps]);
  const inactiveTriggerProps = React.useMemo(() => {
    return getTriggerProps(interactionTypeTriggerProps);
  }, [getTriggerProps, interactionTypeTriggerProps]);
  const popupProps = React.useMemo(() => {
    return getFloatingProps();
  }, [getFloatingProps]);
  store.useSyncedValues({
    modal,
    openMethod,
    activeTriggerProps,
    inactiveTriggerProps,
    popupProps,
    floatingRootContext,
    nested: (0, _floatingUiReact.useFloatingParentNodeId)() != null
  });
  const popoverContext = React.useMemo(() => ({
    store
  }), [store]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_PopoverRootContext.PopoverRootContext.Provider, {
    value: popoverContext,
    children: typeof children === 'function' ? children({
      payload
    }) : children
  });
}

/**
 * Groups all parts of the popover.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
function PopoverRoot(props) {
  if ((0, _PopoverRootContext.usePopoverRootContext)(true)) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(PopoverRootComponent, {
      props: props
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_floatingUiReact.FloatingTree, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(PopoverRootComponent, {
      props: props
    })
  });
}