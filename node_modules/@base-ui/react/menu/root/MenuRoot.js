"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuRoot = void 0;
var React = _interopRequireWildcard(require("react"));
var _useTimeout = require("@base-ui/utils/useTimeout");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useId = require("@base-ui/utils/useId");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useOnFirstRender = require("@base-ui/utils/useOnFirstRender");
var _useScrollLock = require("@base-ui/utils/useScrollLock");
var _empty = require("@base-ui/utils/empty");
var _fastHooks = require("@base-ui/utils/fastHooks");
var _floatingUiReact = require("../../floating-ui-react");
var _MenuRootContext = require("./MenuRootContext");
var _MenubarContext = require("../../menubar/MenubarContext");
var _constants = require("../../utils/constants");
var _DirectionContext = require("../../direction-provider/DirectionContext");
var _useOpenInteractionType = require("../../utils/useOpenInteractionType");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _ContextMenuRootContext = require("../../context-menu/root/ContextMenuRootContext");
var _mergeProps = require("../../merge-props");
var _MenuStore = require("../store/MenuStore");
var _popups = require("../../utils/popups");
var _MenuSubmenuRootContext = require("../submenu-root/MenuSubmenuRootContext");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups all parts of the menu.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
const MenuRoot = exports.MenuRoot = (0, _fastHooks.fastComponent)(function MenuRoot(props) {
  const {
    children,
    open: openProp,
    onOpenChange,
    onOpenChangeComplete,
    defaultOpen = false,
    disabled: disabledProp = false,
    modal: modalProp,
    loopFocus = true,
    orientation = 'vertical',
    actionsRef,
    closeParentOnEsc = false,
    handle,
    triggerId: triggerIdProp,
    defaultTriggerId: defaultTriggerIdProp = null,
    highlightItemOnHover = true
  } = props;
  const contextMenuContext = (0, _ContextMenuRootContext.useContextMenuRootContext)(true);
  const parentMenuRootContext = (0, _MenuRootContext.useMenuRootContext)(true);
  const menubarContext = (0, _MenubarContext.useMenubarContext)(true);
  const isSubmenu = (0, _MenuSubmenuRootContext.useMenuSubmenuRootContext)();
  const parentFromContext = React.useMemo(() => {
    if (isSubmenu && parentMenuRootContext) {
      return {
        type: 'menu',
        store: parentMenuRootContext.store
      };
    }
    if (menubarContext) {
      return {
        type: 'menubar',
        context: menubarContext
      };
    }

    // Ensure this is not a Menu nested inside ContextMenu.Trigger.
    // ContextMenu parentContext is always undefined as ContextMenu.Root is instantiated with
    // <MenuRootContext.Provider value={undefined}>
    if (contextMenuContext && !parentMenuRootContext) {
      return {
        type: 'context-menu',
        context: contextMenuContext
      };
    }
    return {
      type: undefined
    };
  }, [contextMenuContext, parentMenuRootContext, menubarContext, isSubmenu]);
  const store = _MenuStore.MenuStore.useStore(handle?.store, {
    open: defaultOpen,
    openProp,
    activeTriggerId: defaultTriggerIdProp,
    triggerIdProp,
    parent: parentFromContext
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
  store.useContextCallback('onOpenChangeComplete', onOpenChangeComplete);
  const floatingTreeRoot = store.useState('floatingTreeRoot');
  const floatingNodeIdFromContext = (0, _floatingUiReact.useFloatingNodeId)(floatingTreeRoot);
  const floatingParentNodeIdFromContext = (0, _floatingUiReact.useFloatingParentNodeId)();
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (contextMenuContext && !parentMenuRootContext) {
      // This is a context menu root.
      // It doesn't support detached triggers yet, so we have to sync the parent context manually.
      store.update({
        parent: {
          type: 'context-menu',
          context: contextMenuContext
        },
        floatingNodeId: floatingNodeIdFromContext,
        floatingParentNodeId: floatingParentNodeIdFromContext
      });
    } else if (parentMenuRootContext) {
      store.update({
        floatingNodeId: floatingNodeIdFromContext,
        floatingParentNodeId: floatingParentNodeIdFromContext
      });
    }
  }, [contextMenuContext, parentMenuRootContext, floatingNodeIdFromContext, floatingParentNodeIdFromContext, store]);
  const open = store.useState('open');
  const activeTriggerElement = store.useState('activeTriggerElement');
  const positionerElement = store.useState('positionerElement');
  const hoverEnabled = store.useState('hoverEnabled');
  const modal = store.useState('modal');
  const disabled = store.useState('disabled');
  const lastOpenChangeReason = store.useState('lastOpenChangeReason');
  const parent = store.useState('parent');
  const activeIndex = store.useState('activeIndex');
  const payload = store.useState('payload');
  const floatingParentNodeId = store.useState('floatingParentNodeId');
  const openEventRef = React.useRef(null);
  const nested = floatingParentNodeId != null;
  let floatingEvents;
  if (process.env.NODE_ENV !== 'production') {
    if (parent.type !== undefined && modalProp !== undefined) {
      console.warn('Base UI: The `modal` prop is not supported on nested menus. It will be ignored.');
    }
  }
  store.useSyncedValues({
    disabled: disabledProp,
    modal: parent.type === undefined ? modalProp : undefined,
    rootId: (0, _useId.useId)()
  });
  const {
    openMethod,
    triggerProps: interactionTypeProps
  } = (0, _useOpenInteractionType.useOpenInteractionType)(open);
  (0, _popups.useImplicitActiveTrigger)(store);
  const {
    forceUnmount
  } = (0, _popups.useOpenStateTransitions)(open, store, () => {
    store.update({
      allowMouseEnter: false,
      stickIfOpen: true
    });
  });
  const allowOutsidePressDismissalRef = React.useRef(parent.type !== 'context-menu');
  const allowOutsidePressDismissalTimeout = (0, _useTimeout.useTimeout)();
  React.useEffect(() => {
    if (!open) {
      openEventRef.current = null;
    }
    if (parent.type !== 'context-menu') {
      return;
    }
    if (!open) {
      allowOutsidePressDismissalTimeout.clear();
      allowOutsidePressDismissalRef.current = false;
      return;
    }

    // With `mousedown` outside press events and long press touch input, there
    // needs to be a grace period after opening to ensure the dismissal event
    // doesn't fire immediately after open.
    allowOutsidePressDismissalTimeout.start(500, () => {
      allowOutsidePressDismissalRef.current = true;
    });
  }, [allowOutsidePressDismissalTimeout, open, parent.type]);
  (0, _useScrollLock.useScrollLock)(open && modal && lastOpenChangeReason !== _reasons.REASONS.triggerHover && openMethod !== 'touch', positionerElement);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!open && !hoverEnabled) {
      store.set('hoverEnabled', true);
    }
  }, [open, hoverEnabled, store]);
  const allowTouchToCloseRef = React.useRef(true);
  const allowTouchToCloseTimeout = (0, _useTimeout.useTimeout)();
  const setOpen = (0, _useStableCallback.useStableCallback)((nextOpen, eventDetails) => {
    const reason = eventDetails.reason;
    if (open === nextOpen && eventDetails.trigger === activeTriggerElement && lastOpenChangeReason === reason) {
      return;
    }
    eventDetails.preventUnmountOnClose = () => {
      store.set('preventUnmountingOnClose', true);
    };

    // Do not immediately reset the activeTriggerId to allow
    // exit animations to play and focus to be returned correctly.
    if (!nextOpen && eventDetails.trigger == null) {
      eventDetails.trigger = activeTriggerElement ?? undefined;
    }
    onOpenChange?.(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    const details = {
      open: nextOpen,
      nativeEvent: eventDetails.event,
      reason: eventDetails.reason,
      nested
    };
    floatingEvents?.emit('openchange', details);
    const nativeEvent = eventDetails.event;
    if (nextOpen === false && nativeEvent?.type === 'click' && nativeEvent.pointerType === 'touch' && !allowTouchToCloseRef.current) {
      return;
    }

    // Workaround `enableFocusInside` in Floating UI setting `tabindex=0` of a non-highlighted
    // option upon close when tabbing out due to `keepMounted=true`:
    // https://github.com/floating-ui/floating-ui/pull/3004/files#diff-962a7439cdeb09ea98d4b622a45d517bce07ad8c3f866e089bda05f4b0bbd875R194-R199
    // This otherwise causes options to retain `tabindex=0` incorrectly when the popup is closed
    // when tabbing outside.
    if (!nextOpen && activeIndex !== null) {
      const activeOption = store.context.itemDomElements.current[activeIndex];
      // Wait for Floating UI's focus effect to have fired
      queueMicrotask(() => {
        activeOption?.setAttribute('tabindex', '-1');
      });
    }

    // Prevent the menu from closing on mobile devices that have a delayed click event.
    // In some cases the menu, when tapped, will fire the focus event first and then the click event.
    // Without this guard, the menu will close immediately after opening.
    if (nextOpen && reason === _reasons.REASONS.triggerFocus) {
      allowTouchToCloseRef.current = false;
      allowTouchToCloseTimeout.start(300, () => {
        allowTouchToCloseRef.current = true;
      });
    } else {
      allowTouchToCloseRef.current = true;
      allowTouchToCloseTimeout.clear();
    }
    const isKeyboardClick = (reason === _reasons.REASONS.triggerPress || reason === _reasons.REASONS.itemPress) && nativeEvent.detail === 0 && nativeEvent?.isTrusted;
    const isDismissClose = !nextOpen && (reason === _reasons.REASONS.escapeKey || reason == null);
    const updatedState = {
      open: nextOpen,
      openChangeReason: reason
    };
    openEventRef.current = eventDetails.event ?? null;

    // If a popup is closing, the `trigger` may be null.
    // We want to keep the previous value so that exit animations are played and focus is returned correctly.
    const newTriggerId = eventDetails.trigger?.id ?? null;
    if (newTriggerId || nextOpen) {
      updatedState.activeTriggerId = newTriggerId;
      updatedState.activeTriggerElement = eventDetails.trigger ?? null;
    }
    store.update(updatedState);
    if (parent.type === 'menubar' && (reason === _reasons.REASONS.triggerFocus || reason === _reasons.REASONS.focusOut || reason === _reasons.REASONS.triggerHover || reason === _reasons.REASONS.listNavigation || reason === _reasons.REASONS.siblingOpen)) {
      store.set('instantType', 'group');
    } else if (isKeyboardClick || isDismissClose) {
      store.set('instantType', isKeyboardClick ? 'click' : 'dismiss');
    } else {
      store.set('instantType', undefined);
    }
  });
  const createMenuEventDetails = React.useCallback(reason => {
    const details = (0, _createBaseUIEventDetails.createChangeEventDetails)(reason);
    details.preventUnmountOnClose = () => {
      store.set('preventUnmountingOnClose', true);
    };
    return details;
  }, [store]);
  const handleImperativeClose = React.useCallback(() => {
    store.setOpen(false, createMenuEventDetails(_reasons.REASONS.imperativeAction));
  }, [store, createMenuEventDetails]);
  React.useImperativeHandle(actionsRef, () => ({
    unmount: forceUnmount,
    close: handleImperativeClose
  }), [forceUnmount, handleImperativeClose]);
  let ctx;
  if (parent.type === 'context-menu') {
    ctx = parent.context;
  }
  React.useImperativeHandle(ctx?.positionerRef, () => positionerElement, [positionerElement]);
  React.useImperativeHandle(ctx?.actionsRef, () => ({
    setOpen
  }), [setOpen]);
  const floatingRootContext = (0, _floatingUiReact.useSyncedFloatingRootContext)({
    popupStore: store,
    onOpenChange: setOpen
  });
  floatingEvents = floatingRootContext.context.events;
  React.useEffect(() => {
    const handleSetOpenEvent = ({
      open: nextOpen,
      eventDetails
    }) => setOpen(nextOpen, eventDetails);
    floatingEvents.on('setOpen', handleSetOpenEvent);
    return () => {
      floatingEvents?.off('setOpen', handleSetOpenEvent);
    };
  }, [floatingEvents, setOpen]);
  const dismiss = (0, _floatingUiReact.useDismiss)(floatingRootContext, {
    enabled: !disabled,
    bubbles: {
      escapeKey: closeParentOnEsc && parent.type === 'menu'
    },
    outsidePress() {
      if (parent.type !== 'context-menu' || openEventRef.current?.type === 'contextmenu') {
        return true;
      }
      return allowOutsidePressDismissalRef.current;
    },
    externalTree: nested ? floatingTreeRoot : undefined
  });
  const role = (0, _floatingUiReact.useRole)(floatingRootContext, {
    role: 'menu'
  });
  const direction = (0, _DirectionContext.useDirection)();
  const setActiveIndex = React.useCallback(index => {
    if (store.select('activeIndex') === index) {
      return;
    }
    store.set('activeIndex', index);
  }, [store]);
  const listNavigation = (0, _floatingUiReact.useListNavigation)(floatingRootContext, {
    enabled: !disabled,
    listRef: store.context.itemDomElements,
    activeIndex,
    nested: parent.type !== undefined,
    loopFocus,
    orientation,
    parentOrientation: parent.type === 'menubar' ? parent.context.orientation : undefined,
    rtl: direction === 'rtl',
    disabledIndices: _empty.EMPTY_ARRAY,
    onNavigate: setActiveIndex,
    openOnArrowKeyDown: parent.type !== 'context-menu',
    externalTree: nested ? floatingTreeRoot : undefined,
    focusItemOnHover: highlightItemOnHover
  });
  const onTypingChange = React.useCallback(nextTyping => {
    store.context.typingRef.current = nextTyping;
  }, [store]);
  const typeahead = (0, _floatingUiReact.useTypeahead)(floatingRootContext, {
    listRef: store.context.itemLabels,
    elementsRef: store.context.itemDomElements,
    activeIndex,
    resetMs: _constants.TYPEAHEAD_RESET_MS,
    onMatch: index => {
      if (open && index !== activeIndex) {
        store.set('activeIndex', index);
      }
    },
    onTypingChange
  });
  const {
    getReferenceProps,
    getFloatingProps,
    getItemProps,
    getTriggerProps
  } = (0, _floatingUiReact.useInteractions)([dismiss, role, listNavigation, typeahead]);
  const activeTriggerProps = React.useMemo(() => {
    const mergedProps = (0, _mergeProps.mergeProps)(getReferenceProps(), {
      onMouseMove() {
        store.set('allowMouseEnter', true);
      }
    }, interactionTypeProps);
    delete mergedProps.role;
    return mergedProps;
  }, [getReferenceProps, store, interactionTypeProps]);
  const inactiveTriggerProps = React.useMemo(() => {
    const triggerProps = getTriggerProps();
    if (!triggerProps) {
      return triggerProps;
    }
    const mergedProps = (0, _mergeProps.mergeProps)(triggerProps, interactionTypeProps);
    delete mergedProps.role;
    delete mergedProps['aria-controls'];
    return mergedProps;
  }, [getTriggerProps, interactionTypeProps]);
  const popupProps = React.useMemo(() => getFloatingProps({
    onMouseMove() {
      store.set('allowMouseEnter', true);
      if (parent.type === 'menu') {
        store.set('hoverEnabled', false);
      }
    },
    onClick() {
      if (store.select('hoverEnabled')) {
        store.set('hoverEnabled', false);
      }
    },
    onKeyDown(event) {
      // The Menubar's CompositeRoot captures keyboard events via
      // event delegation. This works well when Menu.Root is nested inside Menubar,
      // but with detached triggers we need to manually forward the event to the CompositeRoot.
      const relay = store.select('keyboardEventRelay');
      if (relay && !event.isPropagationStopped()) {
        relay(event);
      }
    }
  }), [getFloatingProps, parent.type, store]);
  const itemProps = React.useMemo(() => getItemProps(), [getItemProps]);
  store.useSyncedValues({
    floatingRootContext,
    activeTriggerProps,
    inactiveTriggerProps,
    popupProps,
    itemProps
  });
  const context = React.useMemo(() => ({
    store,
    parent: parentFromContext
  }), [store, parentFromContext]);
  const content = /*#__PURE__*/(0, _jsxRuntime.jsx)(_MenuRootContext.MenuRootContext.Provider, {
    value: context,
    children: typeof children === 'function' ? children({
      payload
    }) : children
  });
  if (parent.type === undefined || parent.type === 'context-menu') {
    // set up a FloatingTree to provide the context to nested menus
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_floatingUiReact.FloatingTree, {
      externalTree: floatingTreeRoot,
      children: content
    });
  }
  return content;
});
if (process.env.NODE_ENV !== "production") MenuRoot.displayName = "MenuRoot";