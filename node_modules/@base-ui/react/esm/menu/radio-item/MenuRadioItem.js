'use client';

import * as React from 'react';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useMenuRadioGroupContext } from "../radio-group/MenuRadioGroupContext.js";
import { MenuRadioItemContext } from "./MenuRadioItemContext.js";
import { itemMapping } from "../utils/stateAttributesMapping.js";
import { useCompositeListItem } from "../../composite/list/useCompositeListItem.js";
import { REGULAR_ITEM, useMenuItem } from "../item/useMenuItem.js";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";

/**
 * A menu item that works like a radio button in a given group.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const MenuRadioItem = /*#__PURE__*/React.forwardRef(function MenuRadioItem(componentProps, forwardedRef) {
  const {
    render,
    className,
    id: idProp,
    label,
    nativeButton = false,
    disabled: disabledProp = false,
    closeOnClick = false,
    value,
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
    value: selectedValue,
    setValue: setSelectedValue,
    disabled: groupDisabled
  } = useMenuRadioGroupContext();
  const disabled = groupDisabled || disabledProp;
  const checked = selectedValue === value;
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
    setSelectedValue(value, details);
  });
  const element = useRenderElement('div', componentProps, {
    state,
    stateAttributesMapping: itemMapping,
    props: [itemProps, {
      role: 'menuitemradio',
      'aria-checked': checked,
      onClick: handleClick
    }, elementProps, getItemProps],
    ref: [itemRef, forwardedRef, listItem.ref]
  });
  return /*#__PURE__*/_jsx(MenuRadioItemContext.Provider, {
    value: state,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") MenuRadioItem.displayName = "MenuRadioItem";