'use client';

import * as React from 'react';
import { useTimeout, Timeout } from '@base-ui/utils/useTimeout';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { getDelay } from "../hooks/useHoverShared.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { jsx as _jsx } from "react/jsx-runtime";
const FloatingDelayGroupContext = /*#__PURE__*/React.createContext({
  hasProvider: false,
  timeoutMs: 0,
  delayRef: {
    current: 0
  },
  initialDelayRef: {
    current: 0
  },
  timeout: new Timeout(),
  currentIdRef: {
    current: null
  },
  currentContextRef: {
    current: null
  }
});
if (process.env.NODE_ENV !== "production") FloatingDelayGroupContext.displayName = "FloatingDelayGroupContext";
/**
 * Experimental next version of `FloatingDelayGroup` to become the default
 * in the future. This component is not yet stable.
 * Provides context for a group of floating elements that should share a
 * `delay`. Unlike `FloatingDelayGroup`, `useDelayGroup` with this
 * component does not cause a re-render of unrelated consumers of the
 * context when the delay changes.
 * @see https://floating-ui.com/docs/FloatingDelayGroup
 * @internal
 */
export function FloatingDelayGroup(props) {
  const {
    children,
    delay,
    timeoutMs = 0
  } = props;
  const delayRef = React.useRef(delay);
  const initialDelayRef = React.useRef(delay);
  const currentIdRef = React.useRef(null);
  const currentContextRef = React.useRef(null);
  const timeout = useTimeout();
  return /*#__PURE__*/_jsx(FloatingDelayGroupContext.Provider, {
    value: React.useMemo(() => ({
      hasProvider: true,
      delayRef,
      initialDelayRef,
      currentIdRef,
      timeoutMs,
      currentContextRef,
      timeout
    }), [timeoutMs, timeout]),
    children: children
  });
}
/**
 * Enables grouping when called inside a component that's a child of a
 * `FloatingDelayGroup`.
 * @see https://floating-ui.com/docs/FloatingDelayGroup
 * @internal
 */
export function useDelayGroup(context, options = {
  open: false
}) {
  const store = 'rootStore' in context ? context.rootStore : context;
  const floatingId = store.useState('floatingId');
  const {
    open
  } = options;
  const groupContext = React.useContext(FloatingDelayGroupContext);
  const {
    currentIdRef,
    delayRef,
    timeoutMs,
    initialDelayRef,
    currentContextRef,
    hasProvider,
    timeout
  } = groupContext;
  const [isInstantPhase, setIsInstantPhase] = React.useState(false);
  useIsoLayoutEffect(() => {
    function unset() {
      setIsInstantPhase(false);
      currentContextRef.current?.setIsInstantPhase(false);
      currentIdRef.current = null;
      currentContextRef.current = null;
      delayRef.current = initialDelayRef.current;
    }
    if (!currentIdRef.current) {
      return undefined;
    }
    if (!open && currentIdRef.current === floatingId) {
      setIsInstantPhase(false);
      if (timeoutMs) {
        const closingId = floatingId;
        timeout.start(timeoutMs, () => {
          // If another tooltip has taken over the group, skip resetting.
          if (store.select('open') || currentIdRef.current && currentIdRef.current !== closingId) {
            return;
          }
          unset();
        });
        return () => {
          timeout.clear();
        };
      }
      unset();
    }
    return undefined;
  }, [open, floatingId, currentIdRef, delayRef, timeoutMs, initialDelayRef, currentContextRef, timeout, store]);
  useIsoLayoutEffect(() => {
    if (!open) {
      return;
    }
    const prevContext = currentContextRef.current;
    const prevId = currentIdRef.current;

    // A new tooltip is opening, so cancel any pending timeout that would reset
    // the group's delay back to the initial value.
    timeout.clear();
    currentContextRef.current = {
      onOpenChange: store.setOpen,
      setIsInstantPhase
    };
    currentIdRef.current = floatingId;
    delayRef.current = {
      open: 0,
      close: getDelay(initialDelayRef.current, 'close')
    };
    if (prevId !== null && prevId !== floatingId) {
      setIsInstantPhase(true);
      prevContext?.setIsInstantPhase(true);
      prevContext?.onOpenChange(false, createChangeEventDetails(REASONS.none));
    } else {
      setIsInstantPhase(false);
      prevContext?.setIsInstantPhase(false);
    }
  }, [open, floatingId, store, currentIdRef, delayRef, timeoutMs, initialDelayRef, currentContextRef, timeout]);
  useIsoLayoutEffect(() => {
    return () => {
      currentContextRef.current = null;
    };
  }, [currentContextRef]);
  return React.useMemo(() => ({
    hasProvider,
    delayRef,
    isInstantPhase
  }), [hasProvider, delayRef, isInstantPhase]);
}