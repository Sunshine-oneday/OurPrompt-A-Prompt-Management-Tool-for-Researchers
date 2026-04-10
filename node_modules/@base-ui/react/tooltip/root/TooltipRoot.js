"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TooltipRoot = void 0;
var React = _interopRequireWildcard(require("react"));
var _fastHooks = require("@base-ui/utils/fastHooks");
var _useOnFirstRender = require("@base-ui/utils/useOnFirstRender");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _TooltipRootContext = require("./TooltipRootContext");
var _floatingUiReact = require("../../floating-ui-react");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _popups = require("../../utils/popups");
var _TooltipStore = require("../store/TooltipStore");
var _reasons = require("../../utils/reasons");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups all parts of the tooltip.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
 */
const TooltipRoot = exports.TooltipRoot = (0, _fastHooks.fastComponent)(function TooltipRoot(props) {
  const {
    disabled = false,
    defaultOpen = false,
    open: openProp,
    disableHoverablePopup = false,
    trackCursorAxis = 'none',
    actionsRef,
    onOpenChange,
    onOpenChangeComplete,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null,
    children
  } = props;
  const store = _TooltipStore.TooltipStore.useStore(handle?.store, {
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
  const openState = store.useState('open');
  const open = !disabled && openState;
  const activeTriggerId = store.useState('activeTriggerId');
  const payload = store.useState('payload');
  store.useSyncedValues({
    trackCursorAxis,
    disableHoverablePopup
  });
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (openState && disabled) {
      store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.disabled));
    }
  }, [openState, disabled, store]);
  store.useSyncedValue('disabled', disabled);
  (0, _popups.useImplicitActiveTrigger)(store);
  const {
    forceUnmount,
    transitionStatus
  } = (0, _popups.useOpenStateTransitions)(open, store);
  const isInstantPhase = store.useState('isInstantPhase');
  const instantType = store.useState('instantType');
  const lastOpenChangeReason = store.useState('lastOpenChangeReason');

  // Animations should be instant in two cases:
  // 1) Opening during the provider's instant phase (adjacent tooltip opens instantly)
  // 2) Closing because another tooltip opened (reason === 'none')
  // Otherwise, allow the animation to play. In particular, do not disable animations
  // during the 'ending' phase unless it's due to a sibling opening.
  const previousInstantTypeRef = React.useRef(null);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (transitionStatus === 'ending' && lastOpenChangeReason === _reasons.REASONS.none || transitionStatus !== 'ending' && isInstantPhase) {
      // Capture the current instant type so we can restore it later
      // and set to 'delay' to disable animations while moving from one trigger to another
      // within a delay group.
      if (instantType !== 'delay') {
        previousInstantTypeRef.current = instantType;
      }
      store.set('instantType', 'delay');
    } else if (previousInstantTypeRef.current !== null) {
      store.set('instantType', previousInstantTypeRef.current);
      previousInstantTypeRef.current = null;
    }
  }, [transitionStatus, isInstantPhase, lastOpenChangeReason, instantType, store]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (open) {
      if (activeTriggerId == null) {
        store.set('payload', undefined);
      }
    }
  }, [store, activeTriggerId, open]);
  const handleImperativeClose = React.useCallback(() => {
    store.setOpen(false, createTooltipEventDetails(store, _reasons.REASONS.imperativeAction));
  }, [store]);
  React.useImperativeHandle(actionsRef, () => ({
    unmount: forceUnmount,
    close: handleImperativeClose
  }), [forceUnmount, handleImperativeClose]);
  const floatingRootContext = store.useState('floatingRootContext');
  const dismiss = (0, _floatingUiReact.useDismiss)(floatingRootContext, {
    enabled: !disabled,
    referencePress: () => store.select('closeOnClick')
  });
  const clientPoint = (0, _floatingUiReact.useClientPoint)(floatingRootContext, {
    enabled: !disabled && trackCursorAxis !== 'none',
    axis: trackCursorAxis === 'none' ? undefined : trackCursorAxis
  });
  const {
    getReferenceProps,
    getFloatingProps,
    getTriggerProps
  } = (0, _floatingUiReact.useInteractions)([dismiss, clientPoint]);
  const activeTriggerProps = React.useMemo(() => getReferenceProps(), [getReferenceProps]);
  const inactiveTriggerProps = React.useMemo(() => getTriggerProps(), [getTriggerProps]);
  const popupProps = React.useMemo(() => getFloatingProps(), [getFloatingProps]);
  store.useSyncedValues({
    activeTriggerProps,
    inactiveTriggerProps,
    popupProps
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_TooltipRootContext.TooltipRootContext.Provider, {
    value: store,
    children: typeof children === 'function' ? children({
      payload
    }) : children
  });
});
if (process.env.NODE_ENV !== "production") TooltipRoot.displayName = "TooltipRoot";
function createTooltipEventDetails(store, reason) {
  const details = (0, _createBaseUIEventDetails.createChangeEventDetails)(reason);
  details.preventUnmountOnClose = () => {
    store.set('preventUnmountingOnClose', true);
  };
  return details;
}