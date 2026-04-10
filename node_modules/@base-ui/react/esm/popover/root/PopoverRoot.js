'use client';

import * as React from 'react';
import { useScrollLock } from '@base-ui/utils/useScrollLock';
import { useOnFirstRender } from '@base-ui/utils/useOnFirstRender';
import { useDismiss, useInteractions, useRole, FloatingTree, useFloatingParentNodeId, useSyncedFloatingRootContext } from "../../floating-ui-react/index.js";
import { PopoverRootContext, usePopoverRootContext } from "./PopoverRootContext.js";
import { PopoverStore } from "../store/PopoverStore.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useImplicitActiveTrigger, useOpenStateTransitions } from "../../utils/popups/index.js";
import { useOpenInteractionType } from "../../utils/useOpenInteractionType.js";
import { jsx as _jsx } from "react/jsx-runtime";
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
  const store = PopoverStore.useStore(handle?.store, {
    modal,
    open: defaultOpen,
    openProp,
    activeTriggerId: defaultTriggerIdProp,
    triggerIdProp
  });

  // Support initially open state when uncontrolled
  useOnFirstRender(() => {
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
  } = useOpenInteractionType(open);
  useImplicitActiveTrigger(store);
  const {
    forceUnmount
  } = useOpenStateTransitions(open, store, () => {
    store.update({
      stickIfOpen: true,
      openChangeReason: null
    });
  });
  useScrollLock(open && modal === true && openReason !== REASONS.triggerHover && openMethod !== 'touch', positionerElement);
  React.useEffect(() => {
    if (!open) {
      store.context.stickIfOpenTimeout.clear();
    }
  }, [store, open]);
  const createPopoverEventDetails = React.useCallback(reason => {
    const details = createChangeEventDetails(reason);
    details.preventUnmountOnClose = () => {
      store.set('preventUnmountingOnClose', true);
    };
    return details;
  }, [store]);
  const handleImperativeClose = React.useCallback(() => {
    store.setOpen(false, createPopoverEventDetails(REASONS.imperativeAction));
  }, [store, createPopoverEventDetails]);
  React.useImperativeHandle(props.actionsRef, () => ({
    unmount: forceUnmount,
    close: handleImperativeClose
  }), [forceUnmount, handleImperativeClose]);
  const floatingRootContext = useSyncedFloatingRootContext({
    popupStore: store,
    onOpenChange: store.setOpen
  });
  const dismiss = useDismiss(floatingRootContext, {
    outsidePressEvent: {
      // Ensure `aria-hidden` on outside elements is removed immediately
      // on outside press when trapping focus.
      mouse: modal === 'trap-focus' ? 'sloppy' : 'intentional',
      touch: 'sloppy'
    }
  });
  const role = useRole(floatingRootContext);
  const {
    getReferenceProps,
    getFloatingProps,
    getTriggerProps
  } = useInteractions([dismiss, role]);
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
    nested: useFloatingParentNodeId() != null
  });
  const popoverContext = React.useMemo(() => ({
    store
  }), [store]);
  return /*#__PURE__*/_jsx(PopoverRootContext.Provider, {
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
export function PopoverRoot(props) {
  if (usePopoverRootContext(true)) {
    return /*#__PURE__*/_jsx(PopoverRootComponent, {
      props: props
    });
  }
  return /*#__PURE__*/_jsx(FloatingTree, {
    children: /*#__PURE__*/_jsx(PopoverRootComponent, {
      props: props
    })
  });
}