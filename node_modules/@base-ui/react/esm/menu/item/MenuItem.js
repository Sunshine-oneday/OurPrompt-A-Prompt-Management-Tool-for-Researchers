'use client';

import * as React from 'react';
import { REGULAR_ITEM, useMenuItem } from "./useMenuItem.js";
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useCompositeListItem } from "../../composite/list/useCompositeListItem.js";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext.js";

/**
 * An individual interactive item in the menu.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuItem = /*#__PURE__*/React.forwardRef(function MenuItem(componentProps, forwardedRef) {
  const {
    render,
    className,
    id: idProp,
    label,
    nativeButton = false,
    disabled = false,
    closeOnClick = true,
    ...elementProps
  } = componentProps;
  const listItem = useCompositeListItem({
    label
  });
  const menuPositionerContext = useMenuPositionerContext(true);
  const id = useBaseUiId(idProp);
  const {
    store
  } = useMenuRootContext();
  const highlighted = store.useState('isActive', listItem.index);
  const itemProps = store.useState('itemProps');
  const {
    getItemProps,
    itemRef
  } = useMenuItem({
    closeOnClick,
    disabled,
    highlighted,
    id,
    store,
    nativeButton,
    nodeId: menuPositionerContext?.nodeId,
    itemMetadata: REGULAR_ITEM
  });
  const state = {
    disabled,
    highlighted
  };
  return useRenderElement('div', componentProps, {
    state,
    props: [itemProps, elementProps, getItemProps],
    ref: [itemRef, forwardedRef, listItem.ref]
  });
});
if (process.env.NODE_ENV !== "production") MenuItem.displayName = "MenuItem";