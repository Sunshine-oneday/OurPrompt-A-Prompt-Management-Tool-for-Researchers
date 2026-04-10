'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { usePopoverRootContext } from "../root/PopoverRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";

/**
 * A heading that labels the popover.
 * Renders an `<h2>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
export const PopoverTitle = /*#__PURE__*/React.forwardRef(function PopoverTitle(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    store
  } = usePopoverRootContext();
  const id = useBaseUiId(elementProps.id);
  useIsoLayoutEffect(() => {
    store.set('titleElementId', id);
    return () => {
      store.set('titleElementId', undefined);
    };
  }, [store, id]);
  const element = useRenderElement('h2', componentProps, {
    ref: forwardedRef,
    props: [{
      id
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") PopoverTitle.displayName = "PopoverTitle";