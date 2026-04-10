'use client';

import * as React from 'react';
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useCompositeListItem } from "../../composite/list/useCompositeListItem.js";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext.js";
import { useMenuItemCommonProps } from "../item/useMenuItemCommonProps.js";
import { useButton } from "../../use-button/index.js";
import { mergeProps } from "../../merge-props/index.js";

/**
 * A link in the menu that can be used to navigate to a different page or section.
 * Renders an `<a>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuLinkItem = /*#__PURE__*/React.forwardRef(function MenuLinkItem(componentProps, forwardedRef) {
  const {
    render,
    className,
    id: idProp,
    label,
    closeOnClick = false,
    ...elementProps
  } = componentProps;
  const linkRef = React.useRef(null);
  const listItem = useCompositeListItem({
    label
  });
  const menuPositionerContext = useMenuPositionerContext(true);
  const nodeId = menuPositionerContext?.nodeId;
  const id = useBaseUiId(idProp);
  const {
    store
  } = useMenuRootContext();
  const highlighted = store.useState('isActive', listItem.index);
  const itemProps = store.useState('itemProps');
  const typingRef = store.context.typingRef;
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    native: false,
    composite: true
  });
  const commonProps = useMenuItemCommonProps({
    closeOnClick,
    highlighted,
    id,
    nodeId,
    store,
    typingRef,
    itemRef: linkRef
  });
  function getItemProps(externalProps) {
    return mergeProps(commonProps, externalProps, getButtonProps);
  }
  const state = React.useMemo(() => ({
    highlighted
  }), [highlighted]);
  return useRenderElement('a', componentProps, {
    state,
    props: [itemProps, elementProps, getItemProps],
    ref: [linkRef, buttonRef, forwardedRef, listItem.ref]
  });
});
if (process.env.NODE_ENV !== "production") MenuLinkItem.displayName = "MenuLinkItem";