'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useControlled } from '@base-ui/utils/useControlled';
import { MenuCheckboxItemContext } from "./MenuCheckboxItemContext.js";
import { REGULAR_ITEM, useMenuItem } from "../item/useMenuItem.js";
import { useCompositeListItem } from "../../composite/list/useCompositeListItem.js";
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { itemMapping } from "../utils/stateAttributesMapping.js";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A menu item that toggles a setting on or off.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuCheckboxItem = /*#__PURE__*/React.forwardRef(function MenuCheckboxItem(componentProps, forwardedRef) {
  const {
    render,
    className,
    id: idProp,
    label,
    nativeButton = false,
    disabled = false,
    closeOnClick = false,
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
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
  const [checked, setChecked] = useControlled({
    controlled: checkedProp,
    default: defaultChecked ?? false,
    name: 'MenuCheckboxItem',
    state: 'checked'
  });
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
  const state = React.useMemo(() => ({
    disabled,
    highlighted,
    checked
  }), [disabled, highlighted, checked]);
  const handleClick = useStableCallback(event => {
    const details = {
      ...createChangeEventDetails(REASONS.itemPress, event.nativeEvent),
      preventUnmountOnClose: () => {}
    };
    onCheckedChange?.(!checked, details);
    if (details.isCanceled) {
      return;
    }
    setChecked(currentlyChecked => !currentlyChecked);
  });
  const element = useRenderElement('div', componentProps, {
    state,
    stateAttributesMapping: itemMapping,
    props: [itemProps, {
      role: 'menuitemcheckbox',
      'aria-checked': checked,
      onClick: handleClick
    }, elementProps, getItemProps],
    ref: [itemRef, forwardedRef, listItem.ref]
  });
  return /*#__PURE__*/_jsx(MenuCheckboxItemContext.Provider, {
    value: state,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") MenuCheckboxItem.displayName = "MenuCheckboxItem";