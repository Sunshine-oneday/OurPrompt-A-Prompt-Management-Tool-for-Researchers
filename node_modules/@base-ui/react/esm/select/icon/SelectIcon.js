'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useSelectRootContext } from "../root/SelectRootContext.js";
import { triggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { selectors } from "../store.js";

/**
 * An icon that indicates that the trigger button opens a select popup.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
export const SelectIcon = /*#__PURE__*/React.forwardRef(function SelectIcon(componentProps, forwardedRef) {
  const {
    className,
    render,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useSelectRootContext();
  const open = useStore(store, selectors.open);
  const state = {
    open
  };
  const element = useRenderElement('span', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      'aria-hidden': true,
      children: '▼'
    }, elementProps],
    stateAttributesMapping: triggerOpenStateMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") SelectIcon.displayName = "SelectIcon";