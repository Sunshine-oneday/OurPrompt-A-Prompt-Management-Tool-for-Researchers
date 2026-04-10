'use client';

import * as React from 'react';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useButton } from "../../use-button/index.js";
import { mergeProps } from "../../merge-props/index.js";
import { useMenuItemCommonProps } from "./useMenuItemCommonProps.js";
export const REGULAR_ITEM = {
  type: 'regular-item'
};
export function useMenuItem(params) {
  const {
    closeOnClick,
    disabled = false,
    highlighted,
    id,
    store,
    typingRef = store.context.typingRef,
    nativeButton,
    itemMetadata,
    nodeId
  } = params;
  const itemRef = React.useRef(null);
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
    composite: true
  });
  const commonProps = useMenuItemCommonProps({
    closeOnClick,
    highlighted,
    id,
    nodeId,
    store,
    typingRef,
    itemRef,
    itemMetadata
  });
  const getItemProps = React.useCallback(externalProps => {
    return mergeProps(commonProps, {
      onMouseEnter() {
        if (itemMetadata.type !== 'submenu-trigger') {
          return;
        }
        itemMetadata.setActive();
      }
    }, externalProps, getButtonProps);
  }, [commonProps, getButtonProps, itemMetadata]);
  const mergedRef = useMergedRefs(itemRef, buttonRef);
  return React.useMemo(() => ({
    getItemProps,
    itemRef: mergedRef
  }), [getItemProps, mergedRef]);
}