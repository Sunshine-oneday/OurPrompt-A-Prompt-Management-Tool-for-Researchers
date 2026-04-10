'use client';

import * as React from 'react';
import { useScrollLock } from '@base-ui/utils/useScrollLock';
import { FloatingNode, FloatingTree, useFloatingNodeId, useFloatingTree } from "../floating-ui-react/index.js";
import { MenubarContext, useMenubarContext } from "./MenubarContext.js";
import { useOpenInteractionType } from "../utils/useOpenInteractionType.js";
import { CompositeRoot } from "../composite/root/CompositeRoot.js";
import { useBaseUiId } from "../utils/useBaseUiId.js";
import { jsx as _jsx } from "react/jsx-runtime";
const menubarStateAttributesMapping = {
  hasSubmenuOpen(value) {
    return {
      'data-has-submenu-open': value ? 'true' : 'false'
    };
  }
};

/**
 * The container for menus.
 *
 * Documentation: [Base UI Menubar](https://base-ui.com/react/components/menubar)
 */
export const Menubar = /*#__PURE__*/React.forwardRef(function Menubar(props, forwardedRef) {
  const {
    orientation = 'horizontal',
    loopFocus = true,
    render,
    className,
    modal = true,
    disabled = false,
    id: idProp,
    ...elementProps
  } = props;
  const [contentElement, setContentElement] = React.useState(null);
  const [hasSubmenuOpen, setHasSubmenuOpen] = React.useState(false);
  const {
    openMethod,
    triggerProps: interactionTypeProps
  } = useOpenInteractionType(hasSubmenuOpen);
  useScrollLock(modal && hasSubmenuOpen && openMethod !== 'touch', contentElement);
  const id = useBaseUiId(idProp);
  const state = {
    orientation,
    modal,
    hasSubmenuOpen
  };
  const contentRef = React.useRef(null);
  const allowMouseUpTriggerRef = React.useRef(false);
  const context = React.useMemo(() => ({
    contentElement,
    setContentElement,
    setHasSubmenuOpen,
    hasSubmenuOpen,
    modal,
    disabled,
    orientation,
    allowMouseUpTriggerRef,
    rootId: id
  }), [contentElement, hasSubmenuOpen, modal, disabled, orientation, id]);
  return /*#__PURE__*/_jsx(MenubarContext.Provider, {
    value: context,
    children: /*#__PURE__*/_jsx(FloatingTree, {
      children: /*#__PURE__*/_jsx(MenubarContent, {
        children: /*#__PURE__*/_jsx(CompositeRoot, {
          render: render,
          className: className,
          state: state,
          stateAttributesMapping: menubarStateAttributesMapping,
          refs: [forwardedRef, setContentElement, contentRef],
          props: [{
            role: 'menubar',
            id
          }, interactionTypeProps, elementProps],
          orientation: orientation,
          loopFocus: loopFocus,
          highlightItemOnHover: hasSubmenuOpen
        })
      })
    })
  });
});
if (process.env.NODE_ENV !== "production") Menubar.displayName = "Menubar";
function MenubarContent(props) {
  const nodeId = useFloatingNodeId();
  const {
    events: menuEvents
  } = useFloatingTree();
  const rootContext = useMenubarContext();
  React.useEffect(() => {
    function onSubmenuOpenChange(details) {
      if (!details.nodeId || details.parentNodeId !== nodeId) {
        return;
      }
      if (details.open) {
        if (!rootContext.hasSubmenuOpen) {
          rootContext.setHasSubmenuOpen(true);
        }
      } else if (details.reason !== 'sibling-open' && details.reason !== 'list-navigation') {
        rootContext.setHasSubmenuOpen(false);
      }
    }
    menuEvents.on('menuopenchange', onSubmenuOpenChange);
    return () => {
      menuEvents.off('menuopenchange', onSubmenuOpenChange);
    };
  }, [menuEvents, nodeId, rootContext]);
  return /*#__PURE__*/_jsx(FloatingNode, {
    id: nodeId,
    children: props.children
  });
}