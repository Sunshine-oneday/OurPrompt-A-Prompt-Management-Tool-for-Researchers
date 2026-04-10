'use client';

import _formatErrorMessage from "@base-ui/utils/formatErrorMessage";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { usePopoverRootContext } from "../root/PopoverRootContext.js";
import { useButton } from "../../use-button/useButton.js";
import { triggerOpenStateMapping, pressableTriggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { CLICK_TRIGGER_IDENTIFIER } from "../../utils/constants.js";
import { safePolygon, useClick, useHoverReferenceInteraction, useInteractions } from "../../floating-ui-react/index.js";
import { OPEN_DELAY } from "../utils/constants.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { FocusGuard } from "../../utils/FocusGuard.js";
import { contains, getNextTabbable, getTabbableAfterElement, getTabbableBeforeElement, isOutsideEvent } from "../../floating-ui-react/utils.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useTriggerDataForwarding } from "../../utils/popups/index.js";

/**
 * A button that opens the popover.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const PopoverTrigger = /*#__PURE__*/React.forwardRef(function PopoverTrigger(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    nativeButton = true,
    handle,
    payload,
    openOnHover = false,
    delay = OPEN_DELAY,
    closeDelay = 0,
    id: idProp,
    ...elementProps
  } = componentProps;
  const rootContext = usePopoverRootContext(true);
  const store = handle?.store ?? rootContext?.store;
  if (!store) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <Popover.Trigger> must be either used within a <Popover.Root> component or provided with a handle.' : _formatErrorMessage(74));
  }
  const thisTriggerId = useBaseUiId(idProp);
  const isTriggerActive = store.useState('isTriggerActive', thisTriggerId);
  const floatingContext = store.useState('floatingRootContext');
  const isOpenedByThisTrigger = store.useState('isOpenedByTrigger', thisTriggerId);
  const triggerElementRef = React.useRef(null);
  const {
    registerTrigger,
    isMountedByThisTrigger
  } = useTriggerDataForwarding(thisTriggerId, triggerElementRef, store, {
    payload,
    disabled,
    openOnHover,
    closeDelay
  });
  const openReason = store.useState('openChangeReason');
  const stickIfOpen = store.useState('stickIfOpen');
  const openMethod = store.useState('openMethod');
  const hoverProps = useHoverReferenceInteraction(floatingContext, {
    enabled: floatingContext != null && openOnHover && (openMethod !== 'touch' || openReason !== REASONS.triggerPress),
    mouseOnly: true,
    move: false,
    handleClose: safePolygon(),
    restMs: delay,
    delay: {
      close: closeDelay
    },
    triggerElementRef,
    isActiveTrigger: isTriggerActive
  });
  const click = useClick(floatingContext, {
    enabled: floatingContext != null,
    stickIfOpen
  });
  const localProps = useInteractions([click]);
  const rootTriggerProps = store.useState('triggerProps', isMountedByThisTrigger);
  const state = {
    disabled,
    open: isOpenedByThisTrigger
  };
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  const stateAttributesMapping = React.useMemo(() => ({
    open(value) {
      if (value && openReason === REASONS.triggerPress) {
        return pressableTriggerOpenStateMapping.open(value);
      }
      return triggerOpenStateMapping.open(value);
    }
  }), [openReason]);
  const element = useRenderElement('button', componentProps, {
    state,
    ref: [buttonRef, forwardedRef, registerTrigger, triggerElementRef],
    props: [localProps.getReferenceProps(), hoverProps, rootTriggerProps, {
      [CLICK_TRIGGER_IDENTIFIER]: '',
      id: thisTriggerId
    }, elementProps, getButtonProps],
    stateAttributesMapping
  });
  const preFocusGuardRef = React.useRef(null);
  const handlePreFocusGuardFocus = useStableCallback(event => {
    ReactDOM.flushSync(() => {
      store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event.nativeEvent, event.currentTarget));
    });
    const previousTabbable = getTabbableBeforeElement(preFocusGuardRef.current);
    previousTabbable?.focus();
  });
  const handleFocusTargetFocus = useStableCallback(event => {
    const positionerElement = store.select('positionerElement');
    if (positionerElement && isOutsideEvent(event, positionerElement)) {
      store.context.beforeContentFocusGuardRef.current?.focus();
    } else {
      ReactDOM.flushSync(() => {
        store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event.nativeEvent, event.currentTarget));
      });
      let nextTabbable = getTabbableAfterElement(store.context.triggerFocusTargetRef.current || triggerElementRef.current);
      while (nextTabbable !== null && contains(positionerElement, nextTabbable)) {
        const prevTabbable = nextTabbable;
        nextTabbable = getNextTabbable(nextTabbable);
        if (nextTabbable === prevTabbable) {
          break;
        }
      }
      nextTabbable?.focus();
    }
  });

  // A fragment with key is required to ensure that the `element` is mounted to the same DOM node
  // regardless of whether the focus guards are rendered or not.

  if (isTriggerActive) {
    return /*#__PURE__*/_jsxs(React.Fragment, {
      children: [/*#__PURE__*/_jsx(FocusGuard, {
        ref: preFocusGuardRef,
        onFocus: handlePreFocusGuardFocus
      }), /*#__PURE__*/_jsx(React.Fragment, {
        children: element
      }, thisTriggerId), /*#__PURE__*/_jsx(FocusGuard, {
        ref: store.context.triggerFocusTargetRef,
        onFocus: handleFocusTargetFocus
      })]
    });
  }
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: element
  }, thisTriggerId);
});
if (process.env.NODE_ENV !== "production") PopoverTrigger.displayName = "PopoverTrigger";