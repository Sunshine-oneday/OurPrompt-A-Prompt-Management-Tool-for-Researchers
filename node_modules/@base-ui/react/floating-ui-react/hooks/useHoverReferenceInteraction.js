"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useHoverReferenceInteraction = useHoverReferenceInteraction;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _dom = require("@floating-ui/utils/dom");
var _useValueAsRef = require("@base-ui/utils/useValueAsRef");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _owner = require("@base-ui/utils/owner");
var _utils = require("../utils");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _FloatingTree = require("../components/FloatingTree");
var _useHoverInteractionSharedState = require("./useHoverInteractionSharedState");
var _useHoverShared = require("./useHoverShared");
const EMPTY_REF = {
  current: null
};

/**
 * Provides hover interactions that should be attached to reference or trigger
 * elements.
 */
function useHoverReferenceInteraction(context, props = {}) {
  const store = 'rootStore' in context ? context.rootStore : context;
  const {
    dataRef,
    events
  } = store.context;
  const {
    enabled = true,
    delay = 0,
    handleClose = null,
    mouseOnly = false,
    restMs = 0,
    move = true,
    triggerElementRef = EMPTY_REF,
    externalTree,
    isActiveTrigger = true,
    getHandleCloseContext
  } = props;
  const tree = (0, _FloatingTree.useFloatingTree)(externalTree);
  const instance = (0, _useHoverInteractionSharedState.useHoverInteractionSharedState)(store);
  const handleCloseRef = (0, _useValueAsRef.useValueAsRef)(handleClose);
  const delayRef = (0, _useValueAsRef.useValueAsRef)(delay);
  const restMsRef = (0, _useValueAsRef.useValueAsRef)(restMs);
  const enabledRef = (0, _useValueAsRef.useValueAsRef)(enabled);
  if (isActiveTrigger) {
    // eslint-disable-next-line no-underscore-dangle
    instance.handleCloseOptions = handleCloseRef.current?.__options;
  }
  const isClickLikeOpenEvent = (0, _useStableCallback.useStableCallback)(() => {
    return (0, _useHoverShared.isClickLikeOpenEvent)(dataRef.current.openEvent?.type, instance.interactedInside);
  });
  const isRelatedTargetInsideEnabledTrigger = (0, _useStableCallback.useStableCallback)(target => {
    return (0, _utils.isTargetInsideEnabledTrigger)(target, store.context.triggerElements);
  });
  const isOverInactiveTrigger = (0, _useStableCallback.useStableCallback)((currentDomReference, currentTarget, target) => {
    const allTriggers = store.context.triggerElements;

    // Fast path for normal usage where handlers are attached directly to triggers.
    if (allTriggers.hasElement(currentTarget)) {
      return !currentDomReference || !(0, _utils.contains)(currentDomReference, currentTarget);
    }

    // Fallback for delegated/wrapper usage where currentTarget may be outside the trigger map.
    if (!(0, _dom.isElement)(target)) {
      return false;
    }
    const targetElement = target;
    return allTriggers.hasMatchingElement(trigger => (0, _utils.contains)(trigger, targetElement)) && (!currentDomReference || !(0, _utils.contains)(currentDomReference, targetElement));
  });
  const closeWithDelay = React.useCallback((event, runElseBranch = true) => {
    const closeDelay = (0, _useHoverShared.getDelay)(delayRef.current, 'close', instance.pointerType);
    if (closeDelay) {
      instance.openChangeTimeout.start(closeDelay, () => {
        store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event));
        tree?.events.emit('floating.closed', event);
      });
    } else if (runElseBranch) {
      instance.openChangeTimeout.clear();
      store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event));
      tree?.events.emit('floating.closed', event);
    }
  }, [delayRef, store, instance, tree]);
  const cleanupMouseMoveHandler = (0, _useStableCallback.useStableCallback)(() => {
    if (!instance.handler) {
      return;
    }
    const doc = (0, _owner.ownerDocument)(store.select('domReferenceElement'));
    doc.removeEventListener('mousemove', instance.handler);
    instance.handler = undefined;
  });
  React.useEffect(() => cleanupMouseMoveHandler, [cleanupMouseMoveHandler]);
  const clearPointerEvents = (0, _useStableCallback.useStableCallback)(() => {
    (0, _useHoverInteractionSharedState.clearSafePolygonPointerEventsMutation)(instance);
  });

  // When closing before opening, clear the delay timeouts to cancel it
  // from showing.
  React.useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    function onOpenChangeLocal(details) {
      if (!details.open) {
        cleanupMouseMoveHandler();
        instance.openChangeTimeout.clear();
        instance.restTimeout.clear();
        instance.blockMouseMove = true;
        instance.restTimeoutPending = false;
      }
    }
    events.on('openchange', onOpenChangeLocal);
    return () => {
      events.off('openchange', onOpenChangeLocal);
    };
  }, [enabled, events, instance, cleanupMouseMoveHandler]);
  React.useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const trigger = triggerElementRef.current ?? (isActiveTrigger ? store.select('domReferenceElement') : null);
    if (!(0, _dom.isElement)(trigger)) {
      return undefined;
    }
    function onMouseEnter(event) {
      instance.openChangeTimeout.clear();
      instance.blockMouseMove = false;
      if (mouseOnly && !(0, _utils.isMouseLikePointerType)(instance.pointerType)) {
        return;
      }

      // Only rest delay is set; there's no fallback delay.
      // This will be handled by `onMouseMove`.
      const restMsValue = (0, _useHoverShared.getRestMs)(restMsRef.current);
      if (restMsValue > 0 && !(0, _useHoverShared.getDelay)(delayRef.current, 'open')) {
        return;
      }
      const openDelay = (0, _useHoverShared.getDelay)(delayRef.current, 'open', instance.pointerType);
      const triggerNode = event.currentTarget ?? null;
      const currentDomReference = store.select('domReferenceElement');
      const isOverInactive = triggerNode == null ? false : isOverInactiveTrigger(currentDomReference, triggerNode, event.target);
      const isOpen = store.select('open');
      const shouldOpen = !isOpen || isOverInactive;

      // When moving between triggers while already open, open immediately without delay
      if (isOverInactive && isOpen) {
        store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event, triggerNode));
      } else if (openDelay) {
        instance.openChangeTimeout.start(openDelay, () => {
          if (shouldOpen) {
            store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event, triggerNode));
          }
        });
      } else if (shouldOpen) {
        store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, event, triggerNode));
      }
    }
    function onMouseLeave(event) {
      if (isClickLikeOpenEvent()) {
        clearPointerEvents();
        return;
      }
      cleanupMouseMoveHandler();
      const domReferenceElement = store.select('domReferenceElement');
      const doc = (0, _owner.ownerDocument)(domReferenceElement);
      instance.restTimeout.clear();
      instance.restTimeoutPending = false;
      const handleCloseContextBase = dataRef.current.floatingContext ?? getHandleCloseContext?.();
      const ignoreRelatedTargetTrigger = isRelatedTargetInsideEnabledTrigger(event.relatedTarget);
      if (ignoreRelatedTargetTrigger) {
        return;
      }
      if (handleCloseRef.current && handleCloseContextBase) {
        if (!store.select('open')) {
          instance.openChangeTimeout.clear();
        }
        const currentTrigger = triggerElementRef.current;
        instance.handler = handleCloseRef.current({
          ...handleCloseContextBase,
          tree,
          x: event.clientX,
          y: event.clientY,
          onClose() {
            clearPointerEvents();
            cleanupMouseMoveHandler();
            if (enabledRef.current && !isClickLikeOpenEvent() && currentTrigger === store.select('domReferenceElement')) {
              closeWithDelay(event, true);
            }
          }
        });
        doc.addEventListener('mousemove', instance.handler);
        instance.handler(event);
        return;
      }
      const shouldClose = instance.pointerType === 'touch' ? !(0, _utils.contains)(store.select('floatingElement'), event.relatedTarget) : true;
      if (shouldClose) {
        closeWithDelay(event);
      }
    }
    if (move) {
      trigger.addEventListener('mousemove', onMouseEnter, {
        once: true
      });
    }
    trigger.addEventListener('mouseenter', onMouseEnter);
    trigger.addEventListener('mouseleave', onMouseLeave);
    return () => {
      if (move) {
        trigger.removeEventListener('mousemove', onMouseEnter);
      }
      trigger.removeEventListener('mouseenter', onMouseEnter);
      trigger.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [cleanupMouseMoveHandler, clearPointerEvents, dataRef, delayRef, closeWithDelay, store, enabled, handleCloseRef, instance, isActiveTrigger, isOverInactiveTrigger, isClickLikeOpenEvent, isRelatedTargetInsideEnabledTrigger, mouseOnly, move, restMsRef, triggerElementRef, tree, enabledRef, getHandleCloseContext]);
  return React.useMemo(() => {
    if (!enabled) {
      return undefined;
    }
    function setPointerRef(event) {
      instance.pointerType = event.pointerType;
    }
    return {
      onPointerDown: setPointerRef,
      onPointerEnter: setPointerRef,
      onMouseMove(event) {
        const {
          nativeEvent
        } = event;
        const trigger = event.currentTarget;
        const currentDomReference = store.select('domReferenceElement');
        const currentOpen = store.select('open');
        const isOverInactive = isOverInactiveTrigger(currentDomReference, trigger, event.target);
        if (mouseOnly && !(0, _utils.isMouseLikePointerType)(instance.pointerType)) {
          return;
        }
        const restMsValue = (0, _useHoverShared.getRestMs)(restMsRef.current);
        if (currentOpen && !isOverInactive || restMsValue === 0) {
          return;
        }
        if (!isOverInactive && instance.restTimeoutPending && event.movementX ** 2 + event.movementY ** 2 < 2) {
          return;
        }
        instance.restTimeout.clear();
        function handleMouseMove() {
          instance.restTimeoutPending = false;

          // A delayed hover open should not override a click-like open that happened
          // while the hover delay was pending.
          if (isClickLikeOpenEvent()) {
            return;
          }
          const latestOpen = store.select('open');
          if (!instance.blockMouseMove && (!latestOpen || isOverInactive)) {
            store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerHover, nativeEvent, trigger));
          }
        }
        if (instance.pointerType === 'touch') {
          ReactDOM.flushSync(() => {
            handleMouseMove();
          });
        } else if (isOverInactive && currentOpen) {
          handleMouseMove();
        } else {
          instance.restTimeoutPending = true;
          instance.restTimeout.start(restMsValue, handleMouseMove);
        }
      }
    };
  }, [enabled, instance, isClickLikeOpenEvent, isOverInactiveTrigger, mouseOnly, store, restMsRef]);
}