'use client';

import _formatErrorMessage from "@base-ui/utils/formatErrorMessage";
import * as React from 'react';
import { safePolygon, useClick, useHoverReferenceInteraction, useInteractions } from "../../floating-ui-react/index.js";
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { triggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { useCompositeListItem } from "../../composite/list/useCompositeListItem.js";
import { useMenuItem } from "../item/useMenuItem.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext.js";
import { useTriggerRegistration } from "../../utils/popups/index.js";
import { useMenuSubmenuRootContext } from "../submenu-root/MenuSubmenuRootContext.js";

/**
 * A menu item that opens a submenu.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuSubmenuTrigger = /*#__PURE__*/React.forwardRef(function SubmenuTriggerComponent(componentProps, forwardedRef) {
  const {
    render,
    className,
    label,
    id: idProp,
    nativeButton = false,
    openOnHover = true,
    delay = 100,
    closeDelay = 0,
    disabled: disabledProp = false,
    ...elementProps
  } = componentProps;
  const listItem = useCompositeListItem();
  const menuPositionerContext = useMenuPositionerContext();
  const {
    store
  } = useMenuRootContext();
  const thisTriggerId = useBaseUiId(idProp);
  const open = store.useState('open');
  const floatingRootContext = store.useState('floatingRootContext');
  const floatingTreeRoot = store.useState('floatingTreeRoot');
  const baseRegisterTrigger = useTriggerRegistration(thisTriggerId, store);
  const registerTrigger = React.useCallback(element => {
    const cleanup = baseRegisterTrigger(element);
    if (element !== null && store.select('open') && store.select('activeTriggerId') == null) {
      store.update({
        activeTriggerId: thisTriggerId,
        activeTriggerElement: element,
        closeDelay
      });
    }
    return cleanup;
  }, [baseRegisterTrigger, closeDelay, store, thisTriggerId]);
  const triggerElementRef = React.useRef(null);
  const handleTriggerElementRef = React.useCallback(el => {
    triggerElementRef.current = el;
    store.set('activeTriggerElement', el);
  }, [store]);
  const submenuRootContext = useMenuSubmenuRootContext();
  if (!submenuRootContext?.parentMenu) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <Menu.SubmenuTrigger> must be placed in <Menu.SubmenuRoot>.' : _formatErrorMessage(37));
  }
  store.useSyncedValue('closeDelay', closeDelay);
  const parentMenuStore = submenuRootContext.parentMenu;
  const itemProps = parentMenuStore.useState('itemProps');
  const highlighted = parentMenuStore.useState('isActive', listItem.index);
  const itemMetadata = React.useMemo(() => ({
    type: 'submenu-trigger',
    setActive() {
      parentMenuStore.set('activeIndex', listItem.index);
    }
  }), [parentMenuStore, listItem.index]);
  const rootDisabled = store.useState('disabled');
  const disabled = disabledProp || rootDisabled;
  const {
    getItemProps,
    itemRef
  } = useMenuItem({
    closeOnClick: false,
    disabled,
    highlighted,
    id: thisTriggerId,
    store,
    typingRef: parentMenuStore.context.typingRef,
    nativeButton,
    itemMetadata,
    nodeId: menuPositionerContext?.nodeId
  });
  const hoverEnabled = store.useState('hoverEnabled');
  const allowMouseEnter = parentMenuStore.useState('allowMouseEnter');
  const hoverProps = useHoverReferenceInteraction(floatingRootContext, {
    enabled: hoverEnabled && openOnHover && !disabled,
    handleClose: safePolygon({
      blockPointerEvents: true
    }),
    mouseOnly: true,
    move: true,
    restMs: delay,
    delay: allowMouseEnter ? {
      open: delay,
      close: closeDelay
    } : 0,
    triggerElementRef,
    externalTree: floatingTreeRoot
  });
  const click = useClick(floatingRootContext, {
    enabled: !disabled,
    event: 'mousedown',
    toggle: !openOnHover,
    ignoreMouse: openOnHover,
    stickIfOpen: false
  });
  const localInteractionProps = useInteractions([click]);
  const rootTriggerProps = store.useState('triggerProps', true);
  delete rootTriggerProps.id;
  const state = {
    disabled,
    highlighted,
    open
  };
  const element = useRenderElement('div', componentProps, {
    state,
    stateAttributesMapping: triggerOpenStateMapping,
    props: [localInteractionProps.getReferenceProps(), hoverProps, rootTriggerProps, itemProps, {
      tabIndex: open || highlighted ? 0 : -1,
      onBlur() {
        if (highlighted) {
          parentMenuStore.set('activeIndex', null);
        }
      }
    }, elementProps, getItemProps],
    ref: [forwardedRef, listItem.ref, itemRef, registerTrigger, handleTriggerElementRef]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") MenuSubmenuTrigger.displayName = "MenuSubmenuTrigger";