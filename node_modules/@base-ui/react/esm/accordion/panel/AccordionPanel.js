'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { warn } from '@base-ui/utils/warn';
import { useCollapsibleRootContext } from "../../collapsible/root/CollapsibleRootContext.js";
import { useCollapsiblePanel } from "../../collapsible/panel/useCollapsiblePanel.js";
import { useAccordionRootContext } from "../root/AccordionRootContext.js";
import { useAccordionItemContext } from "../item/AccordionItemContext.js";
import { accordionStateAttributesMapping } from "../item/stateAttributesMapping.js";
import { AccordionPanelCssVars } from "./AccordionPanelCssVars.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
/**
 * A collapsible panel with the accordion item contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */
export const AccordionPanel = /*#__PURE__*/React.forwardRef(function AccordionPanel(componentProps, forwardedRef) {
  const {
    className,
    hiddenUntilFound: hiddenUntilFoundProp,
    keepMounted: keepMountedProp,
    id: idProp,
    render,
    ...elementProps
  } = componentProps;
  const {
    hiddenUntilFound: contextHiddenUntilFound,
    keepMounted: contextKeepMounted
  } = useAccordionRootContext();
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
    setOpen,
    setVisible,
    transitionDimensionRef,
    visible,
    width,
    setPanelIdState,
    transitionStatus
  } = useCollapsibleRootContext();
  const hiddenUntilFound = hiddenUntilFoundProp ?? contextHiddenUntilFound;
  const keepMounted = keepMountedProp ?? contextKeepMounted;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useIsoLayoutEffect(() => {
      if (keepMountedProp === false && hiddenUntilFound) {
        warn('The `keepMounted={false}` prop on a Accordion.Panel will be ignored when using `contextHiddenUntilFound` on the Panel or the Root since it requires the panel to remain mounted when closed.');
      }
    }, [hiddenUntilFound, keepMountedProp]);
  }
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
  useOpenChangeComplete({
    open: open && transitionStatus === 'idle',
    ref: panelRef,
    onComplete() {
      if (!open) {
        return;
      }
      setDimensions({
        width: undefined,
        height: undefined
      });
    }
  });
  const {
    props
  } = useCollapsiblePanel({
    abortControllerRef,
    animationTypeRef,
    externalRef: forwardedRef,
    height,
    hiddenUntilFound,
    id: idProp ?? panelId,
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
  const {
    state,
    triggerId
  } = useAccordionItemContext();
  const panelState = React.useMemo(() => ({
    ...state,
    transitionStatus
  }), [state, transitionStatus]);
  const element = useRenderElement('div', componentProps, {
    state: panelState,
    ref: [forwardedRef, panelRef],
    props: [props, {
      'aria-labelledby': triggerId,
      role: 'region',
      style: {
        [AccordionPanelCssVars.accordionPanelHeight]: height === undefined ? 'auto' : `${height}px`,
        [AccordionPanelCssVars.accordionPanelWidth]: width === undefined ? 'auto' : `${width}px`
      }
    }, elementProps],
    stateAttributesMapping: accordionStateAttributesMapping
  });
  const shouldRender = keepMounted || hiddenUntilFound || !keepMounted && mounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") AccordionPanel.displayName = "AccordionPanel";