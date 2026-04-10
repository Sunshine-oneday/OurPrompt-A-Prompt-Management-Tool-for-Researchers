"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useHover = useHover;
var React = _interopRequireWildcard(require("react"));
var _dom = require("@floating-ui/utils/dom");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _useValueAsRef = require("@base-ui/utils/useValueAsRef");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _owner = require("@base-ui/utils/owner");
var _utils = require("../utils");
var _FloatingTree = require("../components/FloatingTree");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _constants = require("../utils/constants");
var _useHoverShared = require("./useHoverShared");
const interactiveSelector = `button,[role="button"],select,[tabindex]:not([tabindex="-1"]),${_constants.TYPEABLE_SELECTOR}`;
function isInteractiveElement(element) {
  return element ? Boolean(element.closest(interactiveSelector)) : false;
}
/**
 * Opens the floating element while hovering over the reference element, like
 * CSS `:hover`.
 * @see https://floating-ui.com/docs/useHover
 */
function useHover(context, props = {}) {
  const store = 'rootStore' in context ? context.rootStore : context;
  const open = store.useState('open');
  const floatingElement = store.useState('floatingElement');
  const domReferenceElement = store.useState('domReferenceElement');
  const {
    dataRef,
    events
  } = store.context;
  const {
    delay = 0,
    handleClose = null,
    restMs = 0,
    move = true
  } = props;
  const tree = (0, _FloatingTree.useFloatingTree)();
  const parentId = (0, _FloatingTree.useFloatingParentNodeId)();
  const handleCloseRef = (0, _useValueAsRef.useValueAsRef)(handleClose);
  const delayRef = (0, _useValueAsRef.useValueAsRef)(delay);
  const restMsRef = (0, _useValueAsRef.useValueAsRef)(restMs);
  const pointerTypeRef = React.useRef(undefined);
  const interactedInsideRef = React.useRef(false);
  const timeout = (0, _useTimeout.useTimeout)();
  const handlerRef = React.useRef(undefined);
  const restTimeout = (0, _useTimeout.useTimeout)();
  const blockMouseMoveRef = React.useRef(true);
  const performedPointerEventsMutationRef = React.useRef(false);
  const unbindMouseMoveRef = React.useRef(() => {});
  const restTimeoutPendingRef = React.useRef(false);
  const isHoverOpen = (0, _useStableCallback.useStableCallback)(() => {
    const type = dataRef.current.openEvent?.type;
    return type?.includes('mouse') && type !== 'mousedown';
  });
  const isClickLikeOpenEvent = (0, _useStableCallback.useStableCallback)(() => {
    if (interactedInsideRef.current) {
      return true;
    }
    return dataRef.current.openEvent ? ['click', 'mousedown'].includes(dataRef.current.openEvent.type) : false;
  });

  // When closing before opening, clear the delay timeouts to cancel it
  // from showing.
  React.useEffect(() => {
    function onOpenChangeLocal(details) {
      if (!details.open) {
        timeout.clear();
        restTimeout.clear();
        blockMouseMoveRef.current = true;
        restTimeoutPendingRef.current = false;
      }
    }
    events.on('openchange', onOpenChangeLocal);
    return () => {
      events.off('openchange', onOpenChangeLocal);
    };
  }, [events, timeout, restTimeout]);
  React.useEffect(() => {
    if (!handleCloseRef.current) {
      return undefined;
    }
    if (!open) {
      return undefined;
    }
    function onLeave(event) {
      if (isClickLikeOpenEvent()) {
        return;
      }
      if (isHoverOpen()) {
        store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event, event.currentTarget ?? undefined));
      }
    }
    const html = (0, _owner.ownerDocument)(floatingElement).documentElement;
    html.addEventListener('mouseleave', onLeave);
    return () => {
      html.removeEventListener('mouseleave', onLeave);
    };
  }, [floatingElement, open, store, handleCloseRef, isHoverOpen, isClickLikeOpenEvent]);
  const closeWithDelay = React.useCallback((event, runElseBranch = true) => {
    const closeDelay = (0, _useHoverShared.getDelay)(delayRef.current, 'close', pointerTypeRef.current);
    if (closeDelay && !handlerRef.current) {
      timeout.start(closeDelay, () => store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event)));
    } else if (runElseBranch) {
      timeout.clear();
      store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event));
    }
  }, [delayRef, store, timeout]);
  const cleanupMouseMoveHandler = (0, _useStableCallback.useStableCallback)(() => {
    unbindMouseMoveRef.current();
    handlerRef.current = undefined;
  });
  const clearPointerEvents = (0, _useStableCallback.useStableCallback)(() => {
    if (performedPointerEventsMutationRef.current) {
      const body = (0, _owner.ownerDocument)(floatingElement).body;
      body.style.pointerEvents = '';
      performedPointerEventsMutationRef.current = false;
    }
  });
  const handleInteractInside = (0, _useStableCallback.useStableCallback)(event => {
    const target = (0, _utils.getTarget)(event);
    if (!isInteractiveElement(target)) {
      interactedInsideRef.current = false;
      return;
    }
    interactedInsideRef.current = true;
  });

  // Registering the mouse events on the reference directly to bypass React's
  // delegation system. If the cursor was on a disabled element and then entered
  // the reference (no gap), `mouseenter` doesn't fire in the delegation system.
  React.useEffect(() => {
    function onReferenceMouseEnter(event) {
      timeout.clear();
      blockMouseMoveRef.current = false;
      if ((0, _useHoverShared.getRestMs)(restMsRef.current) > 0 && !(0, _useHoverShared.getDelay)(delayRef.current, 'open')) {
        return;
      }
      const openDelay = (0, _useHoverShared.getDelay)(delayRef.current, 'open', pointerTypeRef.current);
      const trigger = event.currentTarget ?? undefined;
      const domReference = store.select('domReferenceElement');
      const isOverInactiveTrigger = domReference && trigger && !(0, _utils.contains)(domReference, trigger);
      if (openDelay) {
        timeout.start(openDelay, () => {
          if (!store.select('open')) {
            store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event, trigger));
          }
        });
      } else if (!open || isOverInactiveTrigger) {
        store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event, trigger));
      }
    }
    function onReferenceMouseLeave(event) {
      if (isClickLikeOpenEvent()) {
        clearPointerEvents();
        return;
      }
      unbindMouseMoveRef.current();
      const doc = (0, _owner.ownerDocument)(floatingElement);
      restTimeout.clear();
      restTimeoutPendingRef.current = false;
      const triggers = store.context.triggerElements;
      if (event.relatedTarget && triggers.hasElement(event.relatedTarget)) {
        // If the mouse is leaving the reference element to another trigger, don't explicitly close the popup
        // as it will be moved.
        return;
      }
      if (handleCloseRef.current && dataRef.current.floatingContext) {
        // Prevent clearing `onScrollMouseLeave` timeout.
        if (!open) {
          timeout.clear();
        }
        handlerRef.current = handleCloseRef.current({
          ...dataRef.current.floatingContext,
          tree,
          x: event.clientX,
          y: event.clientY,
          onClose() {
            clearPointerEvents();
            cleanupMouseMoveHandler();
            if (!isClickLikeOpenEvent()) {
              closeWithDelay(event, true);
            }
          }
        });
        const handler = handlerRef.current;
        doc.addEventListener('mousemove', handler);
        unbindMouseMoveRef.current = () => {
          doc.removeEventListener('mousemove', handler);
        };
        return;
      }

      // Allow interactivity without `safePolygon` on touch devices. With a
      // pointer, a short close delay is an alternative, so it should work
      // consistently.
      const shouldClose = pointerTypeRef.current === 'touch' ? !(0, _utils.contains)(floatingElement, event.relatedTarget) : true;
      if (shouldClose) {
        closeWithDelay(event);
      }
    }

    // Ensure the floating element closes after scrolling even if the pointer
    // did not move.
    // https://github.com/floating-ui/floating-ui/discussions/1692
    function onScrollMouseLeave(event) {
      if (isClickLikeOpenEvent() || !dataRef.current.floatingContext || !store.select('open')) {
        return;
      }
      const triggers = store.context.triggerElements;
      if (event.relatedTarget && triggers.hasElement(event.relatedTarget)) {
        // If the mouse is leaving the reference element to another trigger, don't explicitly close the popup
        // as it will be moved.
        return;
      }
      handleCloseRef.current?.({
        ...dataRef.current.floatingContext,
        tree,
        x: event.clientX,
        y: event.clientY,
        onClose() {
          clearPointerEvents();
          cleanupMouseMoveHandler();
          if (!isClickLikeOpenEvent()) {
            closeWithDelay(event);
          }
        }
      })(event);
    }
    function onFloatingMouseEnter() {
      timeout.clear();
      clearPointerEvents();
    }
    function onFloatingMouseLeave(event) {
      if (!isClickLikeOpenEvent()) {
        closeWithDelay(event, false);
      }
    }
    const trigger = domReferenceElement;
    if ((0, _dom.isElement)(trigger)) {
      const floating = floatingElement;
      if (open) {
        trigger.addEventListener('mouseleave', onScrollMouseLeave);
      }
      if (move) {
        trigger.addEventListener('mousemove', onReferenceMouseEnter, {
          once: true
        });
      }
      trigger.addEventListener('mouseenter', onReferenceMouseEnter);
      trigger.addEventListener('mouseleave', onReferenceMouseLeave);
      if (floating) {
        floating.addEventListener('mouseleave', onScrollMouseLeave);
        floating.addEventListener('mouseenter', onFloatingMouseEnter);
        floating.addEventListener('mouseleave', onFloatingMouseLeave);
        floating.addEventListener('pointerdown', handleInteractInside, true);
      }
      return () => {
        if (open) {
          trigger.removeEventListener('mouseleave', onScrollMouseLeave);
        }
        if (move) {
          trigger.removeEventListener('mousemove', onReferenceMouseEnter);
        }
        trigger.removeEventListener('mouseenter', onReferenceMouseEnter);
        trigger.removeEventListener('mouseleave', onReferenceMouseLeave);
        if (floating) {
          floating.removeEventListener('mouseleave', onScrollMouseLeave);
          floating.removeEventListener('mouseenter', onFloatingMouseEnter);
          floating.removeEventListener('mouseleave', onFloatingMouseLeave);
          floating.removeEventListener('pointerdown', handleInteractInside, true);
        }
      };
    }
    return undefined;
  }, [move, domReferenceElement, floatingElement, store, closeWithDelay, cleanupMouseMoveHandler, clearPointerEvents, open, tree, delayRef, handleCloseRef, dataRef, isClickLikeOpenEvent, restMsRef, timeout, restTimeout, handleInteractInside]);

  // Block pointer-events of every element other than the reference and floating
  // while the floating element is open and has a `handleClose` handler. Also
  // handles nested floating elements.
  // https://github.com/floating-ui/floating-ui/issues/1722
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (open && handleCloseRef.current?.__options?.blockPointerEvents && isHoverOpen()) {
      performedPointerEventsMutationRef.current = true;
      const floatingEl = floatingElement;
      if ((0, _dom.isElement)(domReferenceElement) && floatingEl) {
        const body = (0, _owner.ownerDocument)(floatingElement).body;
        const ref = domReferenceElement;
        const parentFloating = tree?.nodesRef.current.find(node => node.id === parentId)?.context?.elements.floating;
        if (parentFloating) {
          parentFloating.style.pointerEvents = '';
        }
        body.style.pointerEvents = 'none';
        ref.style.pointerEvents = 'auto';
        floatingEl.style.pointerEvents = 'auto';
        return () => {
          body.style.pointerEvents = '';
          ref.style.pointerEvents = '';
          floatingEl.style.pointerEvents = '';
        };
      }
    }
    return undefined;
  }, [open, parentId, tree, handleCloseRef, isHoverOpen, domReferenceElement, floatingElement]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!open) {
      pointerTypeRef.current = undefined;
      restTimeoutPendingRef.current = false;
      interactedInsideRef.current = false;
      cleanupMouseMoveHandler();
      clearPointerEvents();
    }
  }, [open, cleanupMouseMoveHandler, clearPointerEvents]);
  React.useEffect(() => {
    return () => {
      cleanupMouseMoveHandler();
      timeout.clear();
      restTimeout.clear();
      interactedInsideRef.current = false;
    };
  }, [domReferenceElement, cleanupMouseMoveHandler, timeout, restTimeout]);
  React.useEffect(() => {
    return clearPointerEvents;
  }, [clearPointerEvents]);
  const reference = React.useMemo(() => {
    function setPointerRef(event) {
      pointerTypeRef.current = event.pointerType;
    }
    return {
      onPointerDown: setPointerRef,
      onPointerEnter: setPointerRef,
      onMouseMove(event) {
        const {
          nativeEvent
        } = event;
        const trigger = event.currentTarget;

        // `true` when there are multiple triggers per floating element and user hovers over the one that
        // wasn't used to open the floating element.
        const isOverInactiveTrigger = store.select('domReferenceElement') && !(0, _utils.contains)(store.select('domReferenceElement'), event.target);
        function handleMouseMove() {
          if (!blockMouseMoveRef.current && (!store.select('open') || isOverInactiveTrigger)) {
            store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, nativeEvent, trigger));
          }
        }
        if (store.select('open') && !isOverInactiveTrigger || (0, _useHoverShared.getRestMs)(restMsRef.current) === 0) {
          return;
        }

        // Ignore insignificant movements to account for tremors.
        if (!isOverInactiveTrigger && restTimeoutPendingRef.current && event.movementX ** 2 + event.movementY ** 2 < 2) {
          return;
        }
        restTimeout.clear();
        if (pointerTypeRef.current === 'touch') {
          handleMouseMove();
        } else if (isOverInactiveTrigger) {
          handleMouseMove();
        } else {
          restTimeoutPendingRef.current = true;
          restTimeout.start((0, _useHoverShared.getRestMs)(restMsRef.current), handleMouseMove);
        }
      }
    };
  }, [store, restMsRef, restTimeout]);
  return React.useMemo(() => ({
    reference
  }), [reference]);
}