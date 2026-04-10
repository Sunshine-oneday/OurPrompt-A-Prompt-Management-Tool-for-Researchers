'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { NOOP } from "../../utils/noop.js";
export function useImageLoadingStatus(src, {
  referrerPolicy,
  crossOrigin
}) {
  const [loadingStatus, setLoadingStatus] = React.useState('idle');
  useIsoLayoutEffect(() => {
    if (!src) {
      setLoadingStatus('error');
      return NOOP;
    }
    let isMounted = true;
    const image = new window.Image();
    const updateStatus = status => () => {
      if (!isMounted) {
        return;
      }
      setLoadingStatus(status);
    };
    setLoadingStatus('loading');
    image.onload = updateStatus('loaded');
    image.onerror = updateStatus('error');
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    image.crossOrigin = crossOrigin ?? null;
    image.src = src;
    return () => {
      isMounted = false;
    };
  }, [src, crossOrigin, referrerPolicy]);
  return loadingStatus;
}