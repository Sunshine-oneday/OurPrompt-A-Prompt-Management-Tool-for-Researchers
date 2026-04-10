'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useOnFirstRender } from '@base-ui/utils/useOnFirstRender';
import { useDismiss, useInteractions, FloatingTree } from "../../floating-ui-react/index.js";
import { PreviewCardRootContext, usePreviewCardRootContext } from "./PreviewCardContext.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { PreviewCardStore } from "../store/PreviewCardStore.js";
import { useImplicitActiveTrigger, useOpenStateTransitions } from "../../utils/popups/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
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
  const store = PreviewCardStore.useStore(handle?.store, {
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
  store.useContextCallback('onOpenChange', onOpenChange);
  store.useContextCallback('onOpenChangeComplete', onOpenChangeComplete);
  const open = store.useState('open');
  const activeTriggerId = store.useState('activeTriggerId');
  const payload = store.useState('payload');
  useImplicitActiveTrigger(store);
  const {
    forceUnmount
  } = useOpenStateTransitions(open, store);
  useIsoLayoutEffect(() => {
    if (open) {
      if (activeTriggerId == null) {
        store.set('payload', undefined);
      }
    }
  }, [store, activeTriggerId, open]);
  const handleImperativeClose = React.useCallback(() => {
    store.setOpen(false, createPreviewCardEventDetails(store, REASONS.imperativeAction));
  }, [store]);
  React.useImperativeHandle(actionsRef, () => ({
    unmount: forceUnmount,
    close: handleImperativeClose
  }), [forceUnmount, handleImperativeClose]);
  const floatingRootContext = store.useState('floatingRootContext');
  const dismiss = useDismiss(floatingRootContext);
  const {
    getReferenceProps,
    getTriggerProps,
    getFloatingProps
  } = useInteractions([dismiss]);
  const activeTriggerProps = React.useMemo(() => getReferenceProps(), [getReferenceProps]);
  const inactiveTriggerProps = React.useMemo(() => getTriggerProps(), [getTriggerProps]);
  const popupProps = React.useMemo(() => getFloatingProps(), [getFloatingProps]);
  store.useSyncedValues({
    activeTriggerProps,
    inactiveTriggerProps,
    popupProps
  });
  return /*#__PURE__*/_jsx(PreviewCardRootContext.Provider, {
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
export function PreviewCardRoot(props) {
  if (usePreviewCardRootContext(true)) {
    return /*#__PURE__*/_jsx(PreviewCardRootComponent, {
      ...props
    });
  }
  return /*#__PURE__*/_jsx(FloatingTree, {
    children: /*#__PURE__*/_jsx(PreviewCardRootComponent, {
      ...props
    })
  });
}
function createPreviewCardEventDetails(store, reason) {
  const details = createChangeEventDetails(reason);
  details.preventUnmountOnClose = () => {
    store.set('preventUnmountingOnClose', true);
  };
  return details;
}