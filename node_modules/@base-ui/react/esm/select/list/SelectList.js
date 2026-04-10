'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useStore } from '@base-ui/utils/store';
import { useSelectRootContext } from "../root/SelectRootContext.js";
import { useSelectPositionerContext } from "../positioner/SelectPositionerContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { styleDisableScrollbar } from "../../utils/styles.js";
import { LIST_FUNCTIONAL_STYLES } from "../popup/utils.js";
import { selectors } from "../store.js";

/**
 * A container for the select items.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
export const SelectList = /*#__PURE__*/React.forwardRef(function SelectList(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const {
    store,
    scrollHandlerRef
  } = useSelectRootContext();
  const {
    alignItemWithTriggerActive
  } = useSelectPositionerContext();
  const hasScrollArrows = useStore(store, selectors.hasScrollArrows);
  const openMethod = useStore(store, selectors.openMethod);
  const multiple = useStore(store, selectors.multiple);
  const id = useStore(store, selectors.id);
  const defaultProps = {
    id: `${id}-list`,
    role: 'listbox',
    'aria-multiselectable': multiple || undefined,
    onScroll(event) {
      scrollHandlerRef.current?.(event.currentTarget);
    },
    ...(alignItemWithTriggerActive && {
      style: LIST_FUNCTIONAL_STYLES
    }),
    className: hasScrollArrows && openMethod !== 'touch' ? styleDisableScrollbar.className : undefined
  };
  const setListElement = useStableCallback(element => {
    store.set('listElement', element);
  });
  return useRenderElement('div', componentProps, {
    ref: [forwardedRef, setListElement],
    props: [defaultProps, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") SelectList.displayName = "SelectList";