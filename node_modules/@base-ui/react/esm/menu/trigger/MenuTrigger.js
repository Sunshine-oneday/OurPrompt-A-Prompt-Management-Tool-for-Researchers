'use client';

import _formatErrorMessage from "@base-ui/utils/formatErrorMessage";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useTimeout } from '@base-ui/utils/useTimeout';
import { ownerDocument } from '@base-ui/utils/owner';
import { fastComponentRef } from '@base-ui/utils/fastHooks';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { EMPTY_OBJECT } from '@base-ui/utils/empty';
import { safePolygon, useClick, useFloatingTree, useFocus, useHoverReferenceInteraction, useInteractions, useFloatingNodeId, useFloatingParentNodeId } from "../../floating-ui-react/index.js";
import { FloatingTreeStore } from "../../floating-ui-react/components/FloatingTreeStore.js";
import { contains, getNextTabbable, getTabbableAfterElement, getTabbableBeforeElement, isOutsideEvent } from "../../floating-ui-react/utils.js";
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { pressableTriggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useButton } from "../../use-button/useButton.js";
import { getPseudoElementBounds } from "../../utils/getPseudoElementBounds.js";
import { CompositeItem } from "../../composite/item/CompositeItem.js";
import { useCompositeRootContext } from "../../composite/root/CompositeRootContext.js";
import { findRootOwnerId } from "../utils/findRootOwnerId.js";
import { useTriggerDataForwarding } from "../../utils/popups/index.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { REASONS } from "../../utils/reasons.js";
import { useMixedToggleClickHandler } from "../../utils/useMixedToggleClickHandler.js";
import { useContextMenuRootContext } from "../../context-menu/root/ContextMenuRootContext.js";
import { useMenubarContext } from "../../menubar/MenubarContext.js";
import { PATIENT_CLICK_THRESHOLD } from "../../utils/constants.js";
import { FocusGuard } from "../../utils/FocusGuard.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const BOUNDARY_OFFSET = 2;

/**
 * A button that opens the menu.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuTrigger = fastComponentRef(function MenuTrigger(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp = false,
    nativeButton = true,
    id: idProp,
    openOnHover: openOnHoverProp,
    delay = 100,
    closeDelay = 0,
    handle,
    payload,
    ...elementProps
  } = componentProps;
  const rootContext = useMenuRootContext(true);
  const store = handle?.store ?? rootContext?.store;
  if (!store) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <Menu.Trigger> must be either used within a <Menu.Root> component or provided with a handle.' : _formatErrorMessage(85));
  }
  const thisTriggerId = useBaseUiId(idProp);
  const isTriggerActive = store.useState('isTriggerActive', thisTriggerId);
  const floatingRootContext = store.useState('floatingRootContext');
  const isOpenedByThisTrigger = store.useState('isOpenedByTrigger', thisTriggerId);
  const triggerElementRef = React.useRef(null);
  const parent = useMenuParent();
  const compositeRootContext = useCompositeRootContext(true);
  const floatingTreeRootFromContext = useFloatingTree();
  const floatingTreeRoot = React.useMemo(() => {
    return floatingTreeRootFromContext ?? new FloatingTreeStore();
  }, [floatingTreeRootFromContext]);
  const floatingNodeId = useFloatingNodeId(floatingTreeRoot);
  const floatingParentNodeId = useFloatingParentNodeId();
  const {
    registerTrigger,
    isMountedByThisTrigger
  } = useTriggerDataForwarding(thisTriggerId, triggerElementRef, store, {
    payload,
    closeDelay,
    parent,
    floatingTreeRoot,
    floatingNodeId,
    floatingParentNodeId,
    keyboardEventRelay: compositeRootContext?.relayKeyboardEvent
  });
  const isInMenubar = parent.type === 'menubar';
  const rootDisabled = store.useState('disabled');
  const disabled = disabledProp || rootDisabled || isInMenubar && parent.context.disabled;
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  React.useEffect(() => {
    if (!isOpenedByThisTrigger && parent.type === undefined) {
      store.context.allowMouseUpTriggerRef.current = false;
    }
  }, [store, isOpenedByThisTrigger, parent.type]);
  const triggerRef = React.useRef(null);
  const allowMouseUpTriggerTimeout = useTimeout();
  const handleDocumentMouseUp = useStableCallback(mouseEvent => {
    if (!triggerRef.current) {
      return;
    }
    allowMouseUpTriggerTimeout.clear();
    store.context.allowMouseUpTriggerRef.current = false;
    const mouseUpTarget = mouseEvent.target;
    if (contains(triggerRef.current, mouseUpTarget) || contains(store.select('positionerElement'), mouseUpTarget) || mouseUpTarget === triggerRef.current) {
      return;
    }
    if (mouseUpTarget != null && findRootOwnerId(mouseUpTarget) === store.select('rootId')) {
      return;
    }
    const bounds = getPseudoElementBounds(triggerRef.current);
    if (mouseEvent.clientX >= bounds.left - BOUNDARY_OFFSET && mouseEvent.clientX <= bounds.right + BOUNDARY_OFFSET && mouseEvent.clientY >= bounds.top - BOUNDARY_OFFSET && mouseEvent.clientY <= bounds.bottom + BOUNDARY_OFFSET) {
      return;
    }
    floatingTreeRoot.events.emit('close', {
      domEvent: mouseEvent,
      reason: REASONS.cancelOpen
    });
  });
  React.useEffect(() => {
    if (isOpenedByThisTrigger && store.select('lastOpenChangeReason') === REASONS.triggerHover) {
      const doc = ownerDocument(triggerRef.current);
      doc.addEventListener('mouseup', handleDocumentMouseUp, {
        once: true
      });
    }
  }, [isOpenedByThisTrigger, handleDocumentMouseUp, store]);
  const parentMenubarHasSubmenuOpen = isInMenubar && parent.context.hasSubmenuOpen;
  const openOnHover = openOnHoverProp ?? parentMenubarHasSubmenuOpen;
  const hoverProps = useHoverReferenceInteraction(floatingRootContext, {
    enabled: openOnHover && !disabled && parent.type !== 'context-menu' && (!isInMenubar || parentMenubarHasSubmenuOpen && !isMountedByThisTrigger),
    handleClose: safePolygon({
      blockPointerEvents: !isInMenubar
    }),
    mouseOnly: true,
    move: false,
    restMs: parent.type === undefined ? delay : undefined,
    delay: {
      close: closeDelay
    },
    triggerElementRef,
    externalTree: floatingTreeRoot,
    isActiveTrigger: isTriggerActive
  });

  // Whether to ignore clicks to open the menu.
  // `lastOpenChangeReason` doesn't need to be reactive here, as we need to run this
  // only when `isOpenedByThisTrigger` changes.
  const stickIfOpen = useStickIfOpen(isOpenedByThisTrigger, store.select('lastOpenChangeReason'));
  const click = useClick(floatingRootContext, {
    enabled: !disabled && parent.type !== 'context-menu',
    event: isOpenedByThisTrigger && isInMenubar ? 'click' : 'mousedown',
    toggle: true,
    ignoreMouse: false,
    stickIfOpen: parent.type === undefined ? stickIfOpen : false
  });
  const focus = useFocus(floatingRootContext, {
    enabled: !disabled && parentMenubarHasSubmenuOpen
  });
  const mixedToggleHandlers = useMixedToggleClickHandler({
    open: isOpenedByThisTrigger,
    enabled: isInMenubar,
    mouseDownAction: 'open'
  });
  const localInteractionProps = useInteractions([click, focus]);
  const state = {
    disabled,
    open: isOpenedByThisTrigger
  };
  const rootTriggerProps = store.useState('triggerProps', isMountedByThisTrigger);
  const ref = [triggerRef, forwardedRef, buttonRef, registerTrigger, triggerElementRef];
  const props = [localInteractionProps.getReferenceProps(), hoverProps ?? EMPTY_OBJECT, rootTriggerProps, {
    'aria-haspopup': 'menu',
    id: thisTriggerId,
    onMouseDown: event => {
      if (store.select('open')) {
        return;
      }

      // mousedown -> mouseup on menu item should not trigger it within 200ms.
      allowMouseUpTriggerTimeout.start(200, () => {
        store.context.allowMouseUpTriggerRef.current = true;
      });
      const doc = ownerDocument(event.currentTarget);
      doc.addEventListener('mouseup', handleDocumentMouseUp, {
        once: true
      });
    }
  }, isInMenubar ? {
    role: 'menuitem'
  } : {}, mixedToggleHandlers, elementProps, getButtonProps];
  const preFocusGuardRef = React.useRef(null);
  const handlePreFocusGuardFocus = useStableCallback(event => {
    ReactDOM.flushSync(() => {
      store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event.nativeEvent, event.currentTarget));
    });
    const previousTabbable = getTabbableBeforeElement(preFocusGuardRef.current);
    previousTabbable?.focus();
  });
  const handleFocusTargetFocus = useStableCallback(event => {
    const currentPositionerElement = store.select('positionerElement');
    if (currentPositionerElement && isOutsideEvent(event, currentPositionerElement)) {
      store.context.beforeContentFocusGuardRef.current?.focus();
    } else {
      ReactDOM.flushSync(() => {
        store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event.nativeEvent, event.currentTarget));
      });
      let nextTabbable = getTabbableAfterElement(store.context.triggerFocusTargetRef.current || triggerElementRef.current);
      while (nextTabbable !== null && contains(currentPositionerElement, nextTabbable)) {
        const prevTabbable = nextTabbable;
        nextTabbable = getNextTabbable(nextTabbable);
        if (nextTabbable === prevTabbable) {
          break;
        }
      }
      nextTabbable?.focus();
    }
  });
  const element = useRenderElement('button', componentProps, {
    enabled: !isInMenubar,
    stateAttributesMapping: pressableTriggerOpenStateMapping,
    state,
    ref,
    props
  });
  if (isInMenubar) {
    return /*#__PURE__*/_jsx(CompositeItem, {
      tag: "button",
      render: render,
      className: className,
      state: state,
      refs: ref,
      props: props,
      stateAttributesMapping: pressableTriggerOpenStateMapping
    });
  }

  // A fragment with key is required to ensure that the `element` is mounted to the same DOM node
  // regardless of whether the focus guards are rendered or not.

  if (isOpenedByThisTrigger) {
    return /*#__PURE__*/_jsxs(React.Fragment, {
      children: [/*#__PURE__*/_jsx(FocusGuard, {
        ref: preFocusGuardRef,
        onFocus: handlePreFocusGuardFocus
      }, `${thisTriggerId}-pre-focus-guard`), /*#__PURE__*/_jsx(React.Fragment, {
        children: element
      }, thisTriggerId), /*#__PURE__*/_jsx(FocusGuard, {
        ref: store.context.triggerFocusTargetRef,
        onFocus: handleFocusTargetFocus
      }, `${thisTriggerId}-post-focus-guard`)]
    });
  }
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: element
  }, thisTriggerId);
});
if (process.env.NODE_ENV !== "production") MenuTrigger.displayName = "MenuTrigger";
/**
 * Determines whether to ignore clicks after a hover-open.
 */
function useStickIfOpen(open, openReason) {
  const stickIfOpenTimeout = useTimeout();
  const [stickIfOpen, setStickIfOpen] = React.useState(false);
  useIsoLayoutEffect(() => {
    if (open && openReason === 'trigger-hover') {
      // Only allow "patient" clicks to close the menu if it's open.
      // If they clicked within 500ms of the menu opening, keep it open.
      setStickIfOpen(true);
      stickIfOpenTimeout.start(PATIENT_CLICK_THRESHOLD, () => {
        setStickIfOpen(false);
      });
    } else if (!open) {
      stickIfOpenTimeout.clear();
      setStickIfOpen(false);
    }
  }, [open, openReason, stickIfOpenTimeout]);
  return stickIfOpen;
}
function useMenuParent() {
  const contextMenuContext = useContextMenuRootContext(true);
  const parentContext = useMenuRootContext(true);
  const menubarContext = useMenubarContext(true);
  const parent = React.useMemo(() => {
    if (menubarContext) {
      return {
        type: 'menubar',
        context: menubarContext
      };
    }

    // Ensure this is not a Menu nested inside ContextMenu.Trigger.
    // ContextMenu parentContext is always undefined as ContextMenu.Root is instantiated with
    // <MenuRootContext.Provider value={undefined}>
    if (contextMenuContext && !parentContext) {
      return {
        type: 'context-menu',
        context: contextMenuContext
      };
    }
    return {
      type: undefined
    };
  }, [contextMenuContext, parentContext, menubarContext]);
  return parent;
}