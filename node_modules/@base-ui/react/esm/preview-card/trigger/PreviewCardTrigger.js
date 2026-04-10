'use client';

import _formatErrorMessage from "@base-ui/utils/formatErrorMessage";
import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { usePreviewCardRootContext } from "../root/PreviewCardContext.js";
import { triggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useTriggerDataForwarding } from "../../utils/popups/index.js";
import { CLOSE_DELAY, OPEN_DELAY } from "../utils/constants.js";
import { safePolygon, useFocus, useHoverReferenceInteraction } from "../../floating-ui-react/index.js";

/**
 * A link that opens the preview card.
 * Renders an `<a>` element.
 *
 * Documentation: [Base UI Preview Card](https://base-ui.com/react/components/preview-card)
 */
export const PreviewCardTrigger = /*#__PURE__*/React.forwardRef(function PreviewCardTrigger(componentProps, forwardedRef) {
  const {
    render,
    className,
    delay,
    closeDelay,
    id: idProp,
    payload,
    handle,
    ...elementProps
  } = componentProps;
  const rootContext = usePreviewCardRootContext(true);
  const store = handle?.store ?? rootContext;
  if (!store) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <PreviewCard.Trigger> must be either used within a <PreviewCard.Root> component or provided with a handle.' : _formatErrorMessage(89));
  }
  const thisTriggerId = useBaseUiId(idProp);
  const isTriggerActive = store.useState('isTriggerActive', thisTriggerId);
  const isOpenedByThisTrigger = store.useState('isOpenedByTrigger', thisTriggerId);
  const floatingRootContext = store.useState('floatingRootContext');
  const triggerElementRef = React.useRef(null);
  const delayWithDefault = delay ?? OPEN_DELAY;
  const closeDelayWithDefault = closeDelay ?? CLOSE_DELAY;
  const {
    registerTrigger,
    isMountedByThisTrigger
  } = useTriggerDataForwarding(thisTriggerId, triggerElementRef, store, {
    payload
  });
  useIsoLayoutEffect(() => {
    if (isMountedByThisTrigger) {
      store.context.closeDelayRef.current = closeDelayWithDefault;
    }
  }, [store, isMountedByThisTrigger, closeDelayWithDefault]);
  const hoverProps = useHoverReferenceInteraction(floatingRootContext, {
    mouseOnly: true,
    move: false,
    handleClose: safePolygon(),
    delay: () => ({
      open: delayWithDefault,
      close: closeDelayWithDefault
    }),
    triggerElementRef,
    isActiveTrigger: isTriggerActive
  });
  const focusProps = useFocus(floatingRootContext, {
    delay: delayWithDefault
  });
  const state = {
    open: isOpenedByThisTrigger
  };
  const rootTriggerProps = store.useState('triggerProps', isMountedByThisTrigger);
  const element = useRenderElement('a', componentProps, {
    state,
    ref: [forwardedRef, registerTrigger, triggerElementRef],
    props: [hoverProps, focusProps.reference, rootTriggerProps, {
      id: thisTriggerId
    }, elementProps],
    stateAttributesMapping: triggerOpenStateMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") PreviewCardTrigger.displayName = "PreviewCardTrigger";