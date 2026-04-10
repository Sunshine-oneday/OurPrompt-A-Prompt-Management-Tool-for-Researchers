'use client';

import * as React from 'react';
import { useOnMount } from '@base-ui/utils/useOnMount';
import { useRefWithInit } from '@base-ui/utils/useRefWithInit';
import { ToastContext } from "./ToastProviderContext.js";
import { ToastStore } from "../store.js";

/**
 * Provides a context for creating and managing toasts.
 *
 * Documentation: [Base UI Toast](https://base-ui.com/react/components/toast)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const ToastProvider = function ToastProvider(props) {
  const {
    children,
    timeout = 5000,
    limit = 3,
    toastManager
  } = props;
  const store = useRefWithInit(() => new ToastStore({
    timeout,
    limit,
    viewport: null,
    toasts: [],
    hovering: false,
    focused: false,
    isWindowFocused: true,
    prevFocusElement: null
  })).current;
  useOnMount(store.disposeEffect);
  React.useEffect(function subscribeToToastManager() {
    if (!toastManager) {
      return undefined;
    }
    const unsubscribe = toastManager[' subscribe'](({
      action,
      options
    }) => {
      const id = options.id;
      if (action === 'promise' && options.promise) {
        store.promiseToast(options.promise, options);
      } else if (action === 'update' && id) {
        store.updateToast(id, options);
      } else if (action === 'close') {
        store.closeToast(id);
      } else {
        store.addToast(options);
      }
    });
    return unsubscribe;
  }, [store, timeout, toastManager]);
  store.useSyncedValues({
    timeout,
    limit
  });
  return /*#__PURE__*/_jsx(ToastContext.Provider, {
    value: store,
    children: children
  });
};
if (process.env.NODE_ENV !== "production") ToastProvider.displayName = "ToastProvider";