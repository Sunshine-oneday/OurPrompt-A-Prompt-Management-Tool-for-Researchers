'use client';

import _formatErrorMessage from "@base-ui/utils/formatErrorMessage";
import * as React from 'react';
import { useDialogRootContext } from "../root/DialogRootContext.js";
import { useButton } from "../../use-button/useButton.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { triggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { CLICK_TRIGGER_IDENTIFIER } from "../../utils/constants.js";
import { useTriggerDataForwarding } from "../../utils/popups/index.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useClick, useInteractions } from "../../floating-ui-react/index.js";

/**
 * A button that opens the dialog.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
 */
export const DialogTrigger = /*#__PURE__*/React.forwardRef(function DialogTrigger(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    nativeButton = true,
    id: idProp,
    payload,
    handle,
    ...elementProps
  } = componentProps;
  const dialogRootContext = useDialogRootContext(true);
  const store = handle?.store ?? dialogRootContext?.store;
  if (!store) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.' : _formatErrorMessage(79));
  }
  const thisTriggerId = useBaseUiId(idProp);
  const floatingContext = store.useState('floatingRootContext');
  const isOpenedByThisTrigger = store.useState('isOpenedByTrigger', thisTriggerId);
  const triggerElementRef = React.useRef(null);
  const {
    registerTrigger,
    isMountedByThisTrigger
  } = useTriggerDataForwarding(thisTriggerId, triggerElementRef, store, {
    payload
  });
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  const click = useClick(floatingContext, {
    enabled: floatingContext != null
  });
  const localInteractionProps = useInteractions([click]);
  const state = {
    disabled,
    open: isOpenedByThisTrigger
  };
  const rootTriggerProps = store.useState('triggerProps', isMountedByThisTrigger);
  return useRenderElement('button', componentProps, {
    state,
    ref: [buttonRef, forwardedRef, registerTrigger, triggerElementRef],
    props: [localInteractionProps.getReferenceProps(), rootTriggerProps, {
      [CLICK_TRIGGER_IDENTIFIER]: '',
      id: thisTriggerId
    }, elementProps, getButtonProps],
    stateAttributesMapping: triggerOpenStateMapping
  });
});
if (process.env.NODE_ENV !== "production") DialogTrigger.displayName = "DialogTrigger";