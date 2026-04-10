"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AccordionPanel = void 0;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _warn = require("@base-ui/utils/warn");
var _CollapsibleRootContext = require("../../collapsible/root/CollapsibleRootContext");
var _useCollapsiblePanel = require("../../collapsible/panel/useCollapsiblePanel");
var _AccordionRootContext = require("../root/AccordionRootContext");
var _AccordionItemContext = require("../item/AccordionItemContext");
var _stateAttributesMapping = require("../item/stateAttributesMapping");
var _AccordionPanelCssVars = require("./AccordionPanelCssVars");
var _useOpenChangeComplete = require("../../utils/useOpenChangeComplete");
var _useRenderElement = require("../../utils/useRenderElement");
/**
 * A collapsible panel with the accordion item contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */
const AccordionPanel = exports.AccordionPanel = /*#__PURE__*/React.forwardRef(function AccordionPanel(componentProps, forwardedRef) {
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
  } = (0, _AccordionRootContext.useAccordionRootContext)();
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
  } = (0, _CollapsibleRootContext.useCollapsibleRootContext)();
  const hiddenUntilFound = hiddenUntilFoundProp ?? contextHiddenUntilFound;
  const keepMounted = keepMountedProp ?? contextKeepMounted;
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
      if (keepMountedProp === false && hiddenUntilFound) {
        (0, _warn.warn)('The `keepMounted={false}` prop on a Accordion.Panel will be ignored when using `contextHiddenUntilFound` on the Panel or the Root since it requires the panel to remain mounted when closed.');
      }
    }, [hiddenUntilFound, keepMountedProp]);
  }
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (idProp) {
      setPanelIdState(idProp);
      return () => {
        setPanelIdState(undefined);
      };
    }
    return undefined;
  }, [idProp, setPanelIdState]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    setHiddenUntilFound(hiddenUntilFound);
  }, [setHiddenUntilFound, hiddenUntilFound]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    setKeepMounted(keepMounted);
  }, [setKeepMounted, keepMounted]);
  (0, _useOpenChangeComplete.useOpenChangeComplete)({
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
  } = (0, _useCollapsiblePanel.useCollapsiblePanel)({
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
  } = (0, _AccordionItemContext.useAccordionItemContext)();
  const panelState = React.useMemo(() => ({
    ...state,
    transitionStatus
  }), [state, transitionStatus]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state: panelState,
    ref: [forwardedRef, panelRef],
    props: [props, {
      'aria-labelledby': triggerId,
      role: 'region',
      style: {
        [_AccordionPanelCssVars.AccordionPanelCssVars.accordionPanelHeight]: height === undefined ? 'auto' : `${height}px`,
        [_AccordionPanelCssVars.AccordionPanelCssVars.accordionPanelWidth]: width === undefined ? 'auto' : `${width}px`
      }
    }, elementProps],
    stateAttributesMapping: _stateAttributesMapping.accordionStateAttributesMapping
  });
  const shouldRender = keepMounted || hiddenUntilFound || !keepMounted && mounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") AccordionPanel.displayName = "AccordionPanel";