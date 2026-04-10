'use client';

import _formatErrorMessage from "@base-ui/utils/formatErrorMessage";
import * as React from 'react';
import { fastComponentRef } from '@base-ui/utils/fastHooks';
import { useTooltipRootContext } from "../root/TooltipRootContext.js";
import { triggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useTriggerDataForwarding } from "../../utils/popups/index.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useTooltipProviderContext } from "../provider/TooltipProviderContext.js";
import { safePolygon, useDelayGroup, useFocus, useHoverReferenceInteraction } from "../../floating-ui-react/index.js";
import { TooltipTriggerDataAttributes } from "./TooltipTriggerDataAttributes.js";
import { OPEN_DELAY } from "../utils/constants.js";

/**
 * An element to attach the tooltip to.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Tooltip](https://base-ui.com/react/components/tooltip)
 */
export const TooltipTrigger = fastComponentRef(function TooltipTrigger(componentProps, forwardedRef) {
  const {
    className,
    render,
    handle,
    payload,
    disabled: disabledProp,
    delay,
    closeOnClick = true,
    closeDelay,
    id: idProp,
    ...elementProps
  } = componentProps;
  const rootContext = useTooltipRootContext(true);
  const store = handle?.store ?? rootContext;
  if (!store) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <Tooltip.Trigger> must be either used within a <Tooltip.Root> component or provided with a handle.' : _formatErrorMessage(82));
  }
  const thisTriggerId = useBaseUiId(idProp);
  const isTriggerActive = store.useState('isTriggerActive', thisTriggerId);
  const isOpenedByThisTrigger = store.useState('isOpenedByTrigger', thisTriggerId);
  const floatingRootContext = store.useState('floatingRootContext');
  const triggerElementRef = React.useRef(null);
  const delayWithDefault = delay ?? OPEN_DELAY;
  const closeDelayWithDefault = closeDelay ?? 0;
  const {
    registerTrigger,
    isMountedByThisTrigger
  } = useTriggerDataForwarding(thisTriggerId, triggerElementRef, store, {
    payload,
    closeOnClick,
    closeDelay: closeDelayWithDefault
  });
  const providerContext = useTooltipProviderContext();
  const {
    delayRef,
    isInstantPhase,
    hasProvider
  } = useDelayGroup(floatingRootContext, {
    open: isOpenedByThisTrigger
  });
  store.useSyncedValue('isInstantPhase', isInstantPhase);
  const rootDisabled = store.useState('disabled');
  const disabled = disabledProp ?? rootDisabled;
  const trackCursorAxis = store.useState('trackCursorAxis');
  const disableHoverablePopup = store.useState('disableHoverablePopup');
  const hoverProps = useHoverReferenceInteraction(floatingRootContext, {
    enabled: !disabled,
    mouseOnly: true,
    move: false,
    handleClose: !disableHoverablePopup && trackCursorAxis !== 'both' ? safePolygon() : null,
    restMs() {
      const providerDelay = providerContext?.delay;
      const groupOpenValue = typeof delayRef.current === 'object' ? delayRef.current.open : undefined;
      let computedRestMs = delayWithDefault;
      if (hasProvider) {
        if (groupOpenValue !== 0) {
          computedRestMs = delay ?? providerDelay ?? delayWithDefault;
        } else {
          computedRestMs = 0;
        }
      }
      return computedRestMs;
    },
    delay() {
      const closeValue = typeof delayRef.current === 'object' ? delayRef.current.close : undefined;
      let computedCloseDelay = closeDelayWithDefault;
      if (closeDelay == null && hasProvider) {
        computedCloseDelay = closeValue;
      }
      return {
        close: computedCloseDelay
      };
    },
    triggerElementRef,
    isActiveTrigger: isTriggerActive
  });
  const focusProps = useFocus(floatingRootContext, {
    enabled: !disabled
  }).reference;
  const state = {
    open: isOpenedByThisTrigger
  };
  const rootTriggerProps = store.useState('triggerProps', isMountedByThisTrigger);
  const element = useRenderElement('button', componentProps, {
    state,
    ref: [forwardedRef, registerTrigger, triggerElementRef],
    props: [hoverProps, focusProps, rootTriggerProps, {
      onPointerDown() {
        store.set('closeOnClick', closeOnClick);
      },
      id: thisTriggerId,
      [TooltipTriggerDataAttributes.triggerDisabled]: disabled ? '' : undefined
    }, elementProps],
    stateAttributesMapping: triggerOpenStateMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") TooltipTrigger.displayName = "TooltipTrigger";