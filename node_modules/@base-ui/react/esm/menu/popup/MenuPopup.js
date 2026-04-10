'use client';

import * as React from 'react';
import { FloatingFocusManager, useHoverFloatingInteraction } from "../../floating-ui-react/index.js";
import { useMenuRootContext } from "../root/MenuRootContext.js";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useToolbarRootContext } from "../../toolbar/root/ToolbarRootContext.js";
import { COMPOSITE_KEYS } from "../../composite/composite.js";
import { getDisabledMountTransitionStyles } from "../../utils/getDisabledMountTransitionStyles.js";
import { jsx as _jsx } from "react/jsx-runtime";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};

/**
 * A container for the menu items.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuPopup = /*#__PURE__*/React.forwardRef(function MenuPopup(componentProps, forwardedRef) {
  const {
    render,
    className,
    finalFocus,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useMenuRootContext();
  const {
    side,
    align
  } = useMenuPositionerContext();
  const insideToolbar = useToolbarRootContext(true) != null;
  const open = store.useState('open');
  const transitionStatus = store.useState('transitionStatus');
  const popupProps = store.useState('popupProps');
  const mounted = store.useState('mounted');
  const instantType = store.useState('instantType');
  const triggerElement = store.useState('activeTriggerElement');
  const parent = store.useState('parent');
  const lastOpenChangeReason = store.useState('lastOpenChangeReason');
  const rootId = store.useState('rootId');
  const floatingContext = store.useState('floatingRootContext');
  const floatingTreeRoot = store.useState('floatingTreeRoot');
  const closeDelay = store.useState('closeDelay');
  const activeTriggerElement = store.useState('activeTriggerElement');
  const isContextMenu = parent.type === 'context-menu';
  useOpenChangeComplete({
    open,
    ref: store.context.popupRef,
    onComplete() {
      if (open) {
        store.context.onOpenChangeComplete?.(true);
      }
    }
  });
  React.useEffect(() => {
    function handleClose(event) {
      store.setOpen(false, createChangeEventDetails(event.reason, event.domEvent));
    }
    floatingTreeRoot.events.on('close', handleClose);
    return () => {
      floatingTreeRoot.events.off('close', handleClose);
    };
  }, [floatingTreeRoot.events, store]);
  const hoverEnabled = store.useState('hoverEnabled');
  const disabled = store.useState('disabled');
  useHoverFloatingInteraction(floatingContext, {
    enabled: hoverEnabled && !disabled && !isContextMenu && parent.type !== 'menubar',
    closeDelay
  });
  const state = {
    transitionStatus,
    side,
    align,
    open,
    nested: parent.type === 'menu',
    instant: instantType
  };
  const setPopupElement = React.useCallback(element => {
    store.set('popupElement', element);
  }, [store]);
  const element = useRenderElement('div', componentProps, {
    state,
    ref: [forwardedRef, store.context.popupRef, setPopupElement],
    stateAttributesMapping,
    props: [popupProps, {
      onKeyDown(event) {
        if (insideToolbar && COMPOSITE_KEYS.has(event.key)) {
          event.stopPropagation();
        }
      }
    }, getDisabledMountTransitionStyles(transitionStatus), elementProps, {
      'data-rootownerid': rootId
    }]
  });
  let returnFocus = parent.type === undefined || isContextMenu;
  if (triggerElement || parent.type === 'menubar' && lastOpenChangeReason !== REASONS.outsidePress) {
    returnFocus = true;
  }
  return /*#__PURE__*/_jsx(FloatingFocusManager, {
    context: floatingContext,
    modal: isContextMenu,
    disabled: !mounted,
    returnFocus: finalFocus === undefined ? returnFocus : finalFocus,
    initialFocus: parent.type !== 'menu',
    restoreFocus: true,
    externalTree: parent.type !== 'menubar' ? floatingTreeRoot : undefined,
    previousFocusableElement: activeTriggerElement,
    nextFocusableElement: parent.type === undefined ? store.context.triggerFocusTargetRef : undefined,
    beforeContentFocusGuardRef: parent.type === undefined ? store.context.beforeContentFocusGuardRef : undefined,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") MenuPopup.displayName = "MenuPopup";