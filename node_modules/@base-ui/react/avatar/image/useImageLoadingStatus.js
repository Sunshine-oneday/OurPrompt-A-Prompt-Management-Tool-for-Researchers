"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useImageLoadingStatus = useImageLoadingStatus;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _noop = require("../../utils/noop");
function useImageLoadingStatus(src, {
  referrerPolicy,
  crossOrigin
}) {
  const [loadingStatus, setLoadingStatus] = React.useState('idle');
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!src) {
      setLoadingStatus('error');
      return _noop.NOOP;
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