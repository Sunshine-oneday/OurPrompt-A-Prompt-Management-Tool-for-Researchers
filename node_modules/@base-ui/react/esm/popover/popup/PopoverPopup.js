'use client';

import * as React from 'react';
import { isHTMLElement } from '@floating-ui/utils/dom';
import { FloatingFocusManager, useHoverFloatingInteraction } from "../../floating-ui-react/index.js";
import { usePopoverRootContext } from "../root/PopoverRootContext.js";
import { usePopoverPositionerContext } from "../positioner/PopoverPositionerContext.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { REASONS } from "../../utils/reasons.js";
import { COMPOSITE_KEYS } from "../../composite/composite.js";
import { useToolbarRootContext } from "../../toolbar/root/ToolbarRootContext.js";
import { getDisabledMountTransitionStyles } from "../../utils/getDisabledMountTransitionStyles.js";
import { ClosePartProvider, useClosePartCount } from "../../utils/closePart.js";
import { jsx as _jsx } from "react/jsx-runtime";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};

/**
 * A container for the popover contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
export const PopoverPopup = /*#__PURE__*/React.forwardRef(function PopoverPopup(componentProps, forwardedRef) {
  const {
    className,
    render,
    initialFocus,
    finalFocus,
    ...elementProps
  } = componentProps;
  const {
    store
  } = usePopoverRootContext();
  const positioner = usePopoverPositionerContext();
  const insideToolbar = useToolbarRootContext(true) != null;
  const {
    context: closePartContext,
    hasClosePart
  } = useClosePartCount();
  const open = store.useState('open');
  const openMethod = store.useState('openMethod');
  const instantType = store.useState('instantType');
  const transitionStatus = store.useState('transitionStatus');
  const popupProps = store.useState('popupProps');
  const titleId = store.useState('titleElementId');
  const descriptionId = store.useState('descriptionElementId');
  const modal = store.useState('modal');
  const mounted = store.useState('mounted');
  const openReason = store.useState('openChangeReason');
  const activeTriggerElement = store.useState('activeTriggerElement');
  const floatingContext = store.useState('floatingRootContext');
  useOpenChangeComplete({
    open,
    ref: store.context.popupRef,
    onComplete() {
      if (open) {
        store.context.onOpenChangeComplete?.(true);
      }
    }
  });
  const disabled = store.useState('disabled');
  const openOnHover = store.useState('openOnHover');
  const closeDelay = store.useState('closeDelay');
  useHoverFloatingInteraction(floatingContext, {
    enabled: openOnHover && !disabled,
    closeDelay
  });

  // Default initial focus logic:
  // If opened by touch, focus the popup element to prevent the virtual keyboard from opening
  // (this is required for Android specifically as iOS handles this automatically).
  function defaultInitialFocus(interactionType) {
    if (interactionType === 'touch') {
      return store.context.popupRef.current;
    }
    return true;
  }
  const resolvedInitialFocus = initialFocus === undefined ? defaultInitialFocus : initialFocus;
  const state = {
    open,
    side: positioner.side,
    align: positioner.align,
    instant: instantType,
    transitionStatus
  };
  const focusManagerModal = modal !== false && hasClosePart;
  const setPopupElement = React.useCallback(element => {
    store.set('popupElement', element);
  }, [store]);
  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, store.context.popupRef, setPopupElement],
    props: [popupProps, {
      'aria-labelledby': titleId,
      'aria-describedby': descriptionId,
      onKeyDown(event) {
        if (insideToolbar && COMPOSITE_KEYS.has(event.key)) {
          event.stopPropagation();
        }
      }
    }, getDisabledMountTransitionStyles(transitionStatus), elementProps],
    stateAttributesMapping
  });
  return /*#__PURE__*/_jsx(FloatingFocusManager, {
    context: floatingContext,
    openInteractionType: openMethod,
    modal: focusManagerModal,
    disabled: !mounted || openReason === REASONS.triggerHover,
    initialFocus: resolvedInitialFocus,
    returnFocus: finalFocus,
    restoreFocus: "popup",
    previousFocusableElement: isHTMLElement(activeTriggerElement) ? activeTriggerElement : undefined,
    nextFocusableElement: store.context.triggerFocusTargetRef,
    beforeContentFocusGuardRef: store.context.beforeContentFocusGuardRef,
    children: /*#__PURE__*/_jsx(ClosePartProvider, {
      value: closePartContext,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") PopoverPopup.displayName = "PopoverPopup";