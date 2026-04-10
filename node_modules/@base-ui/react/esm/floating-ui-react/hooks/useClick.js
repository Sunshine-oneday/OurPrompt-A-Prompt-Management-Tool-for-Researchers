'use client';

import * as React from 'react';
import { useAnimationFrame } from '@base-ui/utils/useAnimationFrame';
import { useTimeout } from '@base-ui/utils/useTimeout';
import { EMPTY_OBJECT } from "../../utils/constants.js";
import { isClickLikeEvent, isMouseLikePointerType, isTypeableElement } from "../utils.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
/**
 * Opens or closes the floating element when clicking the reference element.
 * @see https://floating-ui.com/docs/useClick
 */
export function useClick(context, props = {}) {
  const store = 'rootStore' in context ? context.rootStore : context;
  const dataRef = store.context.dataRef;
  const {
    enabled = true,
    event: eventOption = 'click',
    toggle = true,
    ignoreMouse = false,
    stickIfOpen = true,
    touchOpenDelay = 0,
    reason = REASONS.triggerPress
  } = props;
  const pointerTypeRef = React.useRef(undefined);
  const frame = useAnimationFrame();
  const touchOpenTimeout = useTimeout();
  const reference = React.useMemo(() => ({
    onPointerDown(event) {
      pointerTypeRef.current = event.pointerType;
    },
    onMouseDown(event) {
      const pointerType = pointerTypeRef.current;
      const nativeEvent = event.nativeEvent;
      const open = store.select('open');

      // Ignore all buttons except for the "main" button.
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
      if (event.button !== 0 || eventOption === 'click' || isMouseLikePointerType(pointerType, true) && ignoreMouse) {
        return;
      }
      const openEvent = dataRef.current.openEvent;
      const openEventType = openEvent?.type;
      const hasClickedOnInactiveTrigger = store.select('domReferenceElement') !== event.currentTarget;
      const nextOpen = open && hasClickedOnInactiveTrigger || !(open && toggle && (openEvent && stickIfOpen ? openEventType === 'click' || openEventType === 'mousedown' : true));

      // Animations sometimes won't run on a typeable element if using a rAF.
      // Focus is always set on these elements. For touch, we may delay opening.
      if (isTypeableElement(nativeEvent.target)) {
        const details = createChangeEventDetails(reason, nativeEvent, nativeEvent.target);
        if (nextOpen && pointerType === 'touch' && touchOpenDelay > 0) {
          touchOpenTimeout.start(touchOpenDelay, () => {
            store.setOpen(true, details);
          });
        } else {
          store.setOpen(nextOpen, details);
        }
        return;
      }

      // Capture the currentTarget before the rAF.
      // as React sets it to null after the event handler completes.
      const eventCurrentTarget = event.currentTarget;

      // Wait until focus is set on the element. This is an alternative to
      // `event.preventDefault()` to avoid :focus-visible from appearing when using a pointer.
      frame.request(() => {
        const details = createChangeEventDetails(reason, nativeEvent, eventCurrentTarget);
        if (nextOpen && pointerType === 'touch' && touchOpenDelay > 0) {
          touchOpenTimeout.start(touchOpenDelay, () => {
            store.setOpen(true, details);
          });
        } else {
          store.setOpen(nextOpen, details);
        }
      });
    },
    onClick(event) {
      if (eventOption === 'mousedown-only') {
        return;
      }
      const pointerType = pointerTypeRef.current;
      if (eventOption === 'mousedown' && pointerType) {
        pointerTypeRef.current = undefined;
        return;
      }
      if (isMouseLikePointerType(pointerType, true) && ignoreMouse) {
        return;
      }
      const open = store.select('open');
      const openEvent = dataRef.current.openEvent;
      const hasClickedOnInactiveTrigger = store.select('domReferenceElement') !== event.currentTarget;
      const nextOpen = open && hasClickedOnInactiveTrigger || !(open && toggle && (openEvent && stickIfOpen ? isClickLikeEvent(openEvent) : true));
      const details = createChangeEventDetails(reason, event.nativeEvent, event.currentTarget);
      if (nextOpen && pointerType === 'touch' && touchOpenDelay > 0) {
        touchOpenTimeout.start(touchOpenDelay, () => {
          store.setOpen(true, details);
        });
      } else {
        store.setOpen(nextOpen, details);
      }
    },
    onKeyDown() {
      pointerTypeRef.current = undefined;
    }
  }), [dataRef, eventOption, ignoreMouse, store, stickIfOpen, toggle, frame, touchOpenTimeout, touchOpenDelay, reason]);
  return React.useMemo(() => enabled ? {
    reference
  } : EMPTY_OBJECT, [enabled, reference]);
}