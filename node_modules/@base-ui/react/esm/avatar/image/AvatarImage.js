'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useAvatarRootContext } from "../root/AvatarRootContext.js";
import { avatarStateAttributesMapping } from "../root/stateAttributesMapping.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useTransitionStatus } from "../../utils/useTransitionStatus.js";
import { useImageLoadingStatus } from "./useImageLoadingStatus.js";
const stateAttributesMapping = {
  ...avatarStateAttributesMapping,
  ...transitionStatusMapping
};

/**
 * The image to be displayed in the avatar.
 * Renders an `<img>` element.
 *
 * Documentation: [Base UI Avatar](https://base-ui.com/react/components/avatar)
 */
export const AvatarImage = /*#__PURE__*/React.forwardRef(function AvatarImage(componentProps, forwardedRef) {
  const {
    className,
    render,
    onLoadingStatusChange: onLoadingStatusChangeProp,
    referrerPolicy,
    crossOrigin,
    ...elementProps
  } = componentProps;
  const context = useAvatarRootContext();
  const imageLoadingStatus = useImageLoadingStatus(componentProps.src, {
    referrerPolicy,
    crossOrigin
  });
  const isVisible = imageLoadingStatus === 'loaded';
  const {
    mounted,
    transitionStatus,
    setMounted
  } = useTransitionStatus(isVisible);
  const imageRef = React.useRef(null);
  const handleLoadingStatusChange = useStableCallback(status => {
    onLoadingStatusChangeProp?.(status);
    context.setImageLoadingStatus(status);
  });
  useIsoLayoutEffect(() => {
    if (imageLoadingStatus !== 'idle') {
      handleLoadingStatusChange(imageLoadingStatus);
    }
  }, [imageLoadingStatus, handleLoadingStatusChange]);
  const state = {
    imageLoadingStatus,
    transitionStatus
  };
  useOpenChangeComplete({
    open: isVisible,
    ref: imageRef,
    onComplete() {
      if (!isVisible) {
        setMounted(false);
      }
    }
  });
  const element = useRenderElement('img', componentProps, {
    state,
    ref: [forwardedRef, imageRef],
    props: elementProps,
    stateAttributesMapping,
    enabled: mounted
  });
  if (!mounted) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") AvatarImage.displayName = "AvatarImage";