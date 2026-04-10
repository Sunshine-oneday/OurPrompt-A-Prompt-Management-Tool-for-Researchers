'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { isElement } from '@floating-ui/utils/dom';
import { useValueAsRef } from '@base-ui/utils/useValueAsRef';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { ownerDocument } from '@base-ui/utils/owner';
import { contains, isMouseLikePointerType, isTargetInsideEnabledTrigger } from "../utils.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useFloatingTree } from "../components/FloatingTree.js";
import { clearSafePolygonPointerEventsMutation, useHoverInteractionSharedState } from "./useHoverInteractionSharedState.js";
import { getDelay, getRestMs, isClickLikeOpenEvent as isClickLikeOpenEventShared } from "./useHoverShared.js";
const EMPTY_REF = {
  current: null
};

/**
 * Provides hover interactions that should be attached to reference or trigger
 * elements.
 */
export function useHoverReferenceInteraction(context, props = {}) {
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
  const tree = useFloatingTree(externalTree);
  const instance = useHoverInteractionSharedState(store);
  const handleCloseRef = useValueAsRef(handleClose);
  const delayRef = useValueAsRef(delay);
  const restMsRef = useValueAsRef(restMs);
  const enabledRef = useValueAsRef(enabled);
  if (isActiveTrigger) {
    // eslint-disable-next-line no-underscore-dangle
    instance.handleCloseOptions = handleCloseRef.current?.__options;
  }
  const isClickLikeOpenEvent = useStableCallback(() => {
    return isClickLikeOpenEventShared(dataRef.current.openEvent?.type, instance.interactedInside);
  });
  const isRelatedTargetInsideEnabledTrigger = useStableCallback(target => {
    return isTargetInsideEnabledTrigger(target, store.context.triggerElements);
  });
  const isOverInactiveTrigger = useStableCallback((currentDomReference, currentTarget, target) => {
    const allTriggers = store.context.triggerElements;

    // Fast path for normal usage where handlers are attached directly to triggers.
    if (allTriggers.hasElement(currentTarget)) {
      return !currentDomReference || !contains(currentDomReference, currentTarget);
    }

    // Fallback for delegated/wrapper usage where currentTarget may be outside the trigger map.
    if (!isElement(target)) {
      return false;
    }
    const targetElement = target;
    return allTriggers.hasMatchingElement(trigger => contains(trigger, targetElement)) && (!currentDomReference || !contains(currentDomReference, targetElement));
  });
  const closeWithDelay = React.useCallback((event, runElseBranch = true) => {
    const closeDelay = getDelay(delayRef.current, 'close', instance.pointerType);
    if (closeDelay) {
      instance.openChangeTimeout.start(closeDelay, () => {
        store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
        tree?.events.emit('floating.closed', event);
      });
    } else if (runElseBranch) {
      instance.openChangeTimeout.clear();
      store.setOpen(false, createChangeEventDetails(REASONS.triggerHover, event));
      tree?.events.emit('floating.closed', event);
    }
  }, [delayRef, store, instance, tree]);
  const cleanupMouseMoveHandler = useStableCallback(() => {
    if (!instance.handler) {
      return;
    }
    const doc = ownerDocument(store.select('domReferenceElement'));
    doc.removeEventListener('mousemove', instance.handler);
    instance.handler = undefined;
  });
  React.useEffect(() => cleanupMouseMoveHandler, [cleanupMouseMoveHandler]);
  const clearPointerEvents = useStableCallback(() => {
    clearSafePolygonPointerEventsMutation(instance);
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
    if (!isElement(trigger)) {
      return undefined;
    }
    function onMouseEnter(event) {
      instance.openChangeTimeout.clear();
      instance.blockMouseMove = false;
      if (mouseOnly && !isMouseLikePointerType(instance.pointerType)) {
        return;
      }

      // Only rest delay is set; there's no fallback delay.
      // This will be handled by `onMouseMove`.
      const restMsValue = getRestMs(restMsRef.current);
      if (restMsValue > 0 && !getDelay(delayRef.current, 'open')) {
        return;
      }
      const openDelay = getDelay(delayRef.current, 'open', instance.pointerType);
      const triggerNode = event.currentTarget ?? null;
      const currentDomReference = store.select('domReferenceElement');
      const isOverInactive = triggerNode == null ? false : isOverInactiveTrigger(currentDomReference, triggerNode, event.target);
      const isOpen = store.select('open');
      const shouldOpen = !isOpen || isOverInactive;

      // When moving between triggers while already open, open immediately without delay
      if (isOverInactive && isOpen) {
        store.setOpen(true, createChangeEventDetails(REASONS.triggerHover, event, triggerNode));
      } else if (openDelay) {
        instance.openChangeTimeout.start(openDelay, () => {
          if (shouldOpen) {
            store.setOpen(true, createChangeEventDetails(REASONS.triggerHover, event, triggerNode));
          }
        });
      } else if (shouldOpen) {
        store.setOpen(true, createChangeEventDetails(REASONS.triggerHover, event, triggerNode));
      }
    }
    function onMouseLeave(event) {
      if (isClickLikeOpenEvent()) {
        clearPointerEvents();
        return;
      }
      cleanupMouseMoveHandler();
      const domReferenceElement = store.select('domReferenceElement');
      const doc = ownerDocument(domReferenceElement);
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
      const shouldClose = instance.pointerType === 'touch' ? !contains(store.select('floatingElement'), event.relatedTarget) : true;
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
        if (mouseOnly && !isMouseLikePointerType(instance.pointerType)) {
          return;
        }
        const restMsValue = getRestMs(restMsRef.current);
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
            store.setOpen(true, createChangeEventDetails(REASONS.triggerHover, nativeEvent, trigger));
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