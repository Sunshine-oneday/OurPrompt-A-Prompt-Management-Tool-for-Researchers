'use client';

import * as React from 'react';
import { FloatingFocusManager } from "../../floating-ui-react/index.js";
import { useDialogRootContext } from "../root/DialogRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { DialogPopupCssVars } from "./DialogPopupCssVars.js";
import { DialogPopupDataAttributes } from "./DialogPopupDataAttributes.js";
import { useDialogPortalContext } from "../portal/DialogPortalContext.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { COMPOSITE_KEYS } from "../../composite/composite.js";
import { jsx as _jsx } from "react/jsx-runtime";
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping,
  nestedDialogOpen(value) {
    return value ? {
      [DialogPopupDataAttributes.nestedDialogOpen]: ''
    } : null;
  }
};

/**
 * A container for the dialog contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
 */
export const DialogPopup = /*#__PURE__*/React.forwardRef(function DialogPopup(componentProps, forwardedRef) {
  const {
    className,
    finalFocus,
    initialFocus,
    render,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useDialogRootContext();
  const descriptionElementId = store.useState('descriptionElementId');
  const disablePointerDismissal = store.useState('disablePointerDismissal');
  const floatingRootContext = store.useState('floatingRootContext');
  const rootPopupProps = store.useState('popupProps');
  const modal = store.useState('modal');
  const mounted = store.useState('mounted');
  const nested = store.useState('nested');
  const nestedOpenDialogCount = store.useState('nestedOpenDialogCount');
  const open = store.useState('open');
  const openMethod = store.useState('openMethod');
  const titleElementId = store.useState('titleElementId');
  const transitionStatus = store.useState('transitionStatus');
  const role = store.useState('role');
  useDialogPortalContext();
  useOpenChangeComplete({
    open,
    ref: store.context.popupRef,
    onComplete() {
      if (open) {
        store.context.onOpenChangeComplete?.(true);
      }
    }
  });

  // Default initial focus logic:
  // If opened by touch, focus the popup element to prevent the virtual keyboard from opening
  // (this is required for Android specifically as iOS handles this automatically).
  function defaultInitialFocus(interactionType) {
    if (interactionType === 'touch') {
      return store.context.popupRef.current;
    }
    return true;
  }
  const resolvedInitialFocus = initialFocus === undefined ? defaultInitialFocus : initialFocus;
  const nestedDialogOpen = nestedOpenDialogCount > 0;
  const state = {
    open,
    nested,
    transitionStatus,
    nestedDialogOpen
  };
  const element = useRenderElement('div', componentProps, {
    state,
    props: [rootPopupProps, {
      'aria-labelledby': titleElementId ?? undefined,
      'aria-describedby': descriptionElementId ?? undefined,
      role,
      tabIndex: -1,
      hidden: !mounted,
      onKeyDown(event) {
        if (COMPOSITE_KEYS.has(event.key)) {
          event.stopPropagation();
        }
      },
      style: {
        [DialogPopupCssVars.nestedDialogs]: nestedOpenDialogCount
      }
    }, elementProps],
    ref: [forwardedRef, store.context.popupRef, store.useStateSetter('popupElement')],
    stateAttributesMapping
  });
  return /*#__PURE__*/_jsx(FloatingFocusManager, {
    context: floatingRootContext,
    openInteractionType: openMethod,
    disabled: !mounted,
    closeOnFocusOut: !disablePointerDismissal,
    initialFocus: resolvedInitialFocus,
    returnFocus: finalFocus,
    modal: modal !== false,
    restoreFocus: "popup",
    children: element
  });
});
if (process.env.NODE_ENV !== "production") DialogPopup.displayName = "DialogPopup";