"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDialogRoot = useDialogRoot;
var React = _interopRequireWildcard(require("react"));
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useScrollLock = require("@base-ui/utils/useScrollLock");
var _floatingUiReact = require("../../floating-ui-react");
var _utils = require("../../floating-ui-react/utils");
var _useOpenInteractionType = require("../../utils/useOpenInteractionType");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _popups = require("../../utils/popups");
function useDialogRoot(params) {
  const {
    store,
    parentContext,
    actionsRef
  } = params;
  const open = store.useState('open');
  const disablePointerDismissal = store.useState('disablePointerDismissal');
  const modal = store.useState('modal');
  const popupElement = store.useState('popupElement');
  const {
    openMethod,
    triggerProps
  } = (0, _useOpenInteractionType.useOpenInteractionType)(open);
  (0, _popups.useImplicitActiveTrigger)(store);
  const {
    forceUnmount
  } = (0, _popups.useOpenStateTransitions)(open, store);
  const createDialogEventDetails = (0, _useStableCallback.useStableCallback)(reason => {
    const details = (0, _createBaseUIEventDetails.createChangeEventDetails)(reason);
    details.preventUnmountOnClose = () => {
      store.set('preventUnmountingOnClose', true);
    };
    return details;
  });
  const handleImperativeClose = React.useCallback(() => {
    store.setOpen(false, createDialogEventDetails(_reasons.REASONS.imperativeAction));
  }, [store, createDialogEventDetails]);
  React.useImperativeHandle(actionsRef, () => ({
    unmount: forceUnmount,
    close: handleImperativeClose
  }), [forceUnmount, handleImperativeClose]);
  const floatingRootContext = (0, _floatingUiReact.useSyncedFloatingRootContext)({
    popupStore: store,
    onOpenChange: store.setOpen,
    treatPopupAsFloatingElement: true,
    noEmit: true
  });
  const [ownNestedOpenDialogs, setOwnNestedOpenDialogs] = React.useState(0);
  const isTopmost = ownNestedOpenDialogs === 0;
  const role = (0, _floatingUiReact.useRole)(floatingRootContext);
  const dismiss = (0, _floatingUiReact.useDismiss)(floatingRootContext, {
    outsidePressEvent() {
      if (store.context.internalBackdropRef.current || store.context.backdropRef.current) {
        return 'intentional';
      }
      // Ensure `aria-hidden` on outside elements is removed immediately
      // on outside press when trapping focus.
      return {
        mouse: modal === 'trap-focus' ? 'sloppy' : 'intentional',
        touch: 'sloppy'
      };
    },
    outsidePress(event) {
      if (!store.context.outsidePressEnabledRef.current) {
        return false;
      }

      // For mouse events, only accept left button (button 0)
      // For touch events, a single touch is equivalent to left button
      if ('button' in event && event.button !== 0) {
        return false;
      }
      if ('touches' in event && event.touches.length !== 1) {
        return false;
      }
      const target = (0, _utils.getTarget)(event);
      if (isTopmost && !disablePointerDismissal) {
        const eventTarget = target;
        // Only close if the click occurred on the dialog's owning backdrop.
        // This supports multiple modal dialogs that aren't nested in the React tree:
        // https://github.com/mui/base-ui/issues/1320
        if (modal) {
          return store.context.internalBackdropRef.current || store.context.backdropRef.current ? store.context.internalBackdropRef.current === eventTarget || store.context.backdropRef.current === eventTarget || (0, _utils.contains)(eventTarget, popupElement) && !eventTarget?.hasAttribute('data-base-ui-portal') : true;
        }
        return true;
      }
      return false;
    },
    escapeKey: isTopmost
  });
  (0, _useScrollLock.useScrollLock)(open && modal === true, popupElement);
  const {
    getReferenceProps,
    getFloatingProps,
    getTriggerProps
  } = (0, _floatingUiReact.useInteractions)([role, dismiss]);

  // Listen for nested open/close events on this store to maintain the count
  store.useContextCallback('onNestedDialogOpen', ownChildrenCount => {
    setOwnNestedOpenDialogs(ownChildrenCount + 1);
  });
  store.useContextCallback('onNestedDialogClose', () => {
    setOwnNestedOpenDialogs(0);
  });

  // Notify parent of our open/close state using parent callbacks, if any
  React.useEffect(() => {
    if (parentContext?.onNestedDialogOpen && open) {
      parentContext.onNestedDialogOpen(ownNestedOpenDialogs);
    }
    if (parentContext?.onNestedDialogClose && !open) {
      parentContext.onNestedDialogClose();
    }
    return () => {
      if (parentContext?.onNestedDialogClose && open) {
        parentContext.onNestedDialogClose();
      }
    };
  }, [open, parentContext, ownNestedOpenDialogs]);
  const activeTriggerProps = React.useMemo(() => getReferenceProps(triggerProps), [getReferenceProps, triggerProps]);
  const inactiveTriggerProps = React.useMemo(() => getTriggerProps(triggerProps), [getTriggerProps, triggerProps]);
  const popupProps = React.useMemo(() => getFloatingProps(), [getFloatingProps]);
  store.useSyncedValues({
    openMethod,
    activeTriggerProps,
    inactiveTriggerProps,
    popupProps,
    floatingRootContext,
    nestedOpenDialogCount: ownNestedOpenDialogs
  });
}