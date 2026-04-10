"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuTrigger = void 0;
var _formatErrorMessage2 = _interopRequireDefault(require("@base-ui/utils/formatErrorMessage"));
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _useTimeout = require("@base-ui/utils/useTimeout");
var _owner = require("@base-ui/utils/owner");
var _fastHooks = require("@base-ui/utils/fastHooks");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _empty = require("@base-ui/utils/empty");
var _floatingUiReact = require("../../floating-ui-react");
var _FloatingTreeStore = require("../../floating-ui-react/components/FloatingTreeStore");
var _utils = require("../../floating-ui-react/utils");
var _MenuRootContext = require("../root/MenuRootContext");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _useRenderElement = require("../../utils/useRenderElement");
var _useButton = require("../../use-button/useButton");
var _getPseudoElementBounds = require("../../utils/getPseudoElementBounds");
var _CompositeItem = require("../../composite/item/CompositeItem");
var _CompositeRootContext = require("../../composite/root/CompositeRootContext");
var _findRootOwnerId = require("../utils/findRootOwnerId");
var _popups = require("../../utils/popups");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _reasons = require("../../utils/reasons");
var _useMixedToggleClickHandler = require("../../utils/useMixedToggleClickHandler");
var _ContextMenuRootContext = require("../../context-menu/root/ContextMenuRootContext");
var _MenubarContext = require("../../menubar/MenubarContext");
var _constants = require("../../utils/constants");
var _FocusGuard = require("../../utils/FocusGuard");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _jsxRuntime = require("react/jsx-runtime");
const BOUNDARY_OFFSET = 2;

/**
 * A button that opens the menu.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
const MenuTrigger = exports.MenuTrigger = (0, _fastHooks.fastComponentRef)(function MenuTrigger(componentProps, forwardedRef) {
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
  const rootContext = (0, _MenuRootContext.useMenuRootContext)(true);
  const store = handle?.store ?? rootContext?.store;
  if (!store) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <Menu.Trigger> must be either used within a <Menu.Root> component or provided with a handle.' : (0, _formatErrorMessage2.default)(85));
  }
  const thisTriggerId = (0, _useBaseUiId.useBaseUiId)(idProp);
  const isTriggerActive = store.useState('isTriggerActive', thisTriggerId);
  const floatingRootContext = store.useState('floatingRootContext');
  const isOpenedByThisTrigger = store.useState('isOpenedByTrigger', thisTriggerId);
  const triggerElementRef = React.useRef(null);
  const parent = useMenuParent();
  const compositeRootContext = (0, _CompositeRootContext.useCompositeRootContext)(true);
  const floatingTreeRootFromContext = (0, _floatingUiReact.useFloatingTree)();
  const floatingTreeRoot = React.useMemo(() => {
    return floatingTreeRootFromContext ?? new _FloatingTreeStore.FloatingTreeStore();
  }, [floatingTreeRootFromContext]);
  const floatingNodeId = (0, _floatingUiReact.useFloatingNodeId)(floatingTreeRoot);
  const floatingParentNodeId = (0, _floatingUiReact.useFloatingParentNodeId)();
  const {
    registerTrigger,
    isMountedByThisTrigger
  } = (0, _popups.useTriggerDataForwarding)(thisTriggerId, triggerElementRef, store, {
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
  } = (0, _useButton.useButton)({
    disabled,
    native: nativeButton
  });
  React.useEffect(() => {
    if (!isOpenedByThisTrigger && parent.type === undefined) {
      store.context.allowMouseUpTriggerRef.current = false;
    }
  }, [store, isOpenedByThisTrigger, parent.type]);
  const triggerRef = React.useRef(null);
  const allowMouseUpTriggerTimeout = (0, _useTimeout.useTimeout)();
  const handleDocumentMouseUp = (0, _useStableCallback.useStableCallback)(mouseEvent => {
    if (!triggerRef.current) {
      return;
    }
    allowMouseUpTriggerTimeout.clear();
    store.context.allowMouseUpTriggerRef.current = false;
    const mouseUpTarget = mouseEvent.target;
    if ((0, _utils.contains)(triggerRef.current, mouseUpTarget) || (0, _utils.contains)(store.select('positionerElement'), mouseUpTarget) || mouseUpTarget === triggerRef.current) {
      return;
    }
    if (mouseUpTarget != null && (0, _findRootOwnerId.findRootOwnerId)(mouseUpTarget) === store.select('rootId')) {
      return;
    }
    const bounds = (0, _getPseudoElementBounds.getPseudoElementBounds)(triggerRef.current);
    if (mouseEvent.clientX >= bounds.left - BOUNDARY_OFFSET && mouseEvent.clientX <= bounds.right + BOUNDARY_OFFSET && mouseEvent.clientY >= bounds.top - BOUNDARY_OFFSET && mouseEvent.clientY <= bounds.bottom + BOUNDARY_OFFSET) {
      return;
    }
    floatingTreeRoot.events.emit('close', {
      domEvent: mouseEvent,
      reason: _reasons.REASONS.cancelOpen
    });
  });
  React.useEffect(() => {
    if (isOpenedByThisTrigger && store.select('lastOpenChangeReason') === _reasons.REASONS.triggerHover) {
      const doc = (0, _owner.ownerDocument)(triggerRef.current);
      doc.addEventListener('mouseup', handleDocumentMouseUp, {
        once: true
      });
    }
  }, [isOpenedByThisTrigger, handleDocumentMouseUp, store]);
  const parentMenubarHasSubmenuOpen = isInMenubar && parent.context.hasSubmenuOpen;
  const openOnHover = openOnHoverProp ?? parentMenubarHasSubmenuOpen;
  const hoverProps = (0, _floatingUiReact.useHoverReferenceInteraction)(floatingRootContext, {
    enabled: openOnHover && !disabled && parent.type !== 'context-menu' && (!isInMenubar || parentMenubarHasSubmenuOpen && !isMountedByThisTrigger),
    handleClose: (0, _floatingUiReact.safePolygon)({
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
  const click = (0, _floatingUiReact.useClick)(floatingRootContext, {
    enabled: !disabled && parent.type !== 'context-menu',
    event: isOpenedByThisTrigger && isInMenubar ? 'click' : 'mousedown',
    toggle: true,
    ignoreMouse: false,
    stickIfOpen: parent.type === undefined ? stickIfOpen : false
  });
  const focus = (0, _floatingUiReact.useFocus)(floatingRootContext, {
    enabled: !disabled && parentMenubarHasSubmenuOpen
  });
  const mixedToggleHandlers = (0, _useMixedToggleClickHandler.useMixedToggleClickHandler)({
    open: isOpenedByThisTrigger,
    enabled: isInMenubar,
    mouseDownAction: 'open'
  });
  const localInteractionProps = (0, _floatingUiReact.useInteractions)([click, focus]);
  const state = {
    disabled,
    open: isOpenedByThisTrigger
  };
  const rootTriggerProps = store.useState('triggerProps', isMountedByThisTrigger);
  const ref = [triggerRef, forwardedRef, buttonRef, registerTrigger, triggerElementRef];
  const props = [localInteractionProps.getReferenceProps(), hoverProps ?? _empty.EMPTY_OBJECT, rootTriggerProps, {
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
      const doc = (0, _owner.ownerDocument)(event.currentTarget);
      doc.addEventListener('mouseup', handleDocumentMouseUp, {
        once: true
      });
    }
  }, isInMenubar ? {
    role: 'menuitem'
  } : {}, mixedToggleHandlers, elementProps, getButtonProps];
  const preFocusGuardRef = React.useRef(null);
  const handlePreFocusGuardFocus = (0, _useStableCallback.useStableCallback)(event => {
    ReactDOM.flushSync(() => {
      store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.focusOut, event.nativeEvent, event.currentTarget));
    });
    const previousTabbable = (0, _utils.getTabbableBeforeElement)(preFocusGuardRef.current);
    previousTabbable?.focus();
  });
  const handleFocusTargetFocus = (0, _useStableCallback.useStableCallback)(event => {
    const currentPositionerElement = store.select('positionerElement');
    if (currentPositionerElement && (0, _utils.isOutsideEvent)(event, currentPositionerElement)) {
      store.context.beforeContentFocusGuardRef.current?.focus();
    } else {
      ReactDOM.flushSync(() => {
        store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.focusOut, event.nativeEvent, event.currentTarget));
      });
      let nextTabbable = (0, _utils.getTabbableAfterElement)(store.context.triggerFocusTargetRef.current || triggerElementRef.current);
      while (nextTabbable !== null && (0, _utils.contains)(currentPositionerElement, nextTabbable)) {
        const prevTabbable = nextTabbable;
        nextTabbable = (0, _utils.getNextTabbable)(nextTabbable);
        if (nextTabbable === prevTabbable) {
          break;
        }
      }
      nextTabbable?.focus();
    }
  });
  const element = (0, _useRenderElement.useRenderElement)('button', componentProps, {
    enabled: !isInMenubar,
    stateAttributesMapping: _popupStateMapping.pressableTriggerOpenStateMapping,
    state,
    ref,
    props
  });
  if (isInMenubar) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeItem.CompositeItem, {
      tag: "button",
      render: render,
      className: className,
      state: state,
      refs: ref,
      props: props,
      stateAttributesMapping: _popupStateMapping.pressableTriggerOpenStateMapping
    });
  }

  // A fragment with key is required to ensure that the `element` is mounted to the same DOM node
  // regardless of whether the focus guards are rendered or not.

  if (isOpenedByThisTrigger) {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
        ref: preFocusGuardRef,
        onFocus: handlePreFocusGuardFocus
      }, `${thisTriggerId}-pre-focus-guard`), /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
        children: element
      }, thisTriggerId), /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
        ref: store.context.triggerFocusTargetRef,
        onFocus: handleFocusTargetFocus
      }, `${thisTriggerId}-post-focus-guard`)]
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  }, thisTriggerId);
});
if (process.env.NODE_ENV !== "production") MenuTrigger.displayName = "MenuTrigger";
/**
 * Determines whether to ignore clicks after a hover-open.
 */
function useStickIfOpen(open, openReason) {
  const stickIfOpenTimeout = (0, _useTimeout.useTimeout)();
  const [stickIfOpen, setStickIfOpen] = React.useState(false);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (open && openReason === 'trigger-hover') {
      // Only allow "patient" clicks to close the menu if it's open.
      // If they clicked within 500ms of the menu opening, keep it open.
      setStickIfOpen(true);
      stickIfOpenTimeout.start(_constants.PATIENT_CLICK_THRESHOLD, () => {
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
  const contextMenuContext = (0, _ContextMenuRootContext.useContextMenuRootContext)(true);
  const parentContext = (0, _MenuRootContext.useMenuRootContext)(true);
  const menubarContext = (0, _MenubarContext.useMenubarContext)(true);
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