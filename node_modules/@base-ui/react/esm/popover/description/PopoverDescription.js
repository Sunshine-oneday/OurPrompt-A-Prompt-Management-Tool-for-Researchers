'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { usePopoverRootContext } from "../root/PopoverRootContext.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * A paragraph with additional information about the popover.
 * Renders a `<p>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
export const PopoverDescription = /*#__PURE__*/React.forwardRef(function PopoverDescription(componentProps, forwardedRef) {
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
    store.set('descriptionElementId', id);
    return () => {
      store.set('descriptionElementId', undefined);
    };
  }, [store, id]);
  const element = useRenderElement('p', componentProps, {
    ref: forwardedRef,
    props: [{
      id
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") PopoverDescription.displayName = "PopoverDescription";