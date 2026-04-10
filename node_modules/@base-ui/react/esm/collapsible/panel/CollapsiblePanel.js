'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { warn } from '@base-ui/utils/warn';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useCollapsibleRootContext } from "../root/CollapsibleRootContext.js";
import { collapsibleStateAttributesMapping } from "../root/stateAttributesMapping.js";
import { useCollapsiblePanel } from "./useCollapsiblePanel.js";
import { CollapsiblePanelCssVars } from "./CollapsiblePanelCssVars.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
/**
 * A panel with the collapsible contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
 */
export const CollapsiblePanel = /*#__PURE__*/React.forwardRef(function CollapsiblePanel(componentProps, forwardedRef) {
  const {
    className,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    render,
    id: idProp,
    ...elementProps
  } = componentProps;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useIsoLayoutEffect(() => {
      if (hiddenUntilFoundProp && keepMountedProp === false) {
        warn('The `keepMounted={false}` prop on a Collapsible will be ignored when using `hiddenUntilFound` since it requires the Panel to remain mounted even when closed.');
      }
    }, [hiddenUntilFoundProp, keepMountedProp]);
  }
  const {
    abortControllerRef,
    animationTypeRef,
    height,
    mounted,
    onOpenChange,
    open,
    panelId,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setHiddenUntilFound,
    setKeepMounted,
    setMounted,
    setPanelIdState,
    setOpen,
    setVisible,
    state,
    transitionDimensionRef,
    visible,
    width,
    transitionStatus
  } = useCollapsibleRootContext();
  const hiddenUntilFound = hiddenUntilFoundProp ?? false;
  const keepMounted = keepMountedProp ?? false;
  useIsoLayoutEffect(() => {
    if (idProp) {
      setPanelIdState(idProp);
      return () => {
        setPanelIdState(undefined);
      };
    }
    return undefined;
  }, [idProp, setPanelIdState]);
  useIsoLayoutEffect(() => {
    setHiddenUntilFound(hiddenUntilFound);
  }, [setHiddenUntilFound, hiddenUntilFound]);
  useIsoLayoutEffect(() => {
    setKeepMounted(keepMounted);
  }, [setKeepMounted, keepMounted]);
  const {
    props
  } = useCollapsiblePanel({
    abortControllerRef,
    animationTypeRef,
    externalRef: forwardedRef,
    height,
    hiddenUntilFound,
    id: panelId,
    keepMounted,
    mounted,
    onOpenChange,
    open,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setMounted,
    setOpen,
    setVisible,
    transitionDimensionRef,
    visible,
    width
  });
  useOpenChangeComplete({
    open: open && transitionStatus === 'idle',
    ref: panelRef,
    onComplete() {
      if (!open) {
        return;
      }
      setDimensions({
        height: undefined,
        width: undefined
      });
    }
  });
  const panelState = React.useMemo(() => ({
    ...state,
    transitionStatus
  }), [state, transitionStatus]);
  const element = useRenderElement('div', componentProps, {
    state: panelState,
    ref: [forwardedRef, panelRef],
    props: [props, {
      style: {
        [CollapsiblePanelCssVars.collapsiblePanelHeight]: height === undefined ? 'auto' : `${height}px`,
        [CollapsiblePanelCssVars.collapsiblePanelWidth]: width === undefined ? 'auto' : `${width}px`
      }
    }, elementProps],
    stateAttributesMapping: collapsibleStateAttributesMapping
  });
  const shouldRender = keepMounted || hiddenUntilFound || !keepMounted && mounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") CollapsiblePanel.displayName = "CollapsiblePanel";