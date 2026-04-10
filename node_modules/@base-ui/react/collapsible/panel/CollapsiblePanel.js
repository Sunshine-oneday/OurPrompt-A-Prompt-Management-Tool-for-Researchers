"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollapsiblePanel = void 0;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _warn = require("@base-ui/utils/warn");
var _useRenderElement = require("../../utils/useRenderElement");
var _CollapsibleRootContext = require("../root/CollapsibleRootContext");
var _stateAttributesMapping = require("../root/stateAttributesMapping");
var _useCollapsiblePanel = require("./useCollapsiblePanel");
var _CollapsiblePanelCssVars = require("./CollapsiblePanelCssVars");
var _useOpenChangeComplete = require("../../utils/useOpenChangeComplete");
/**
 * A panel with the collapsible contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
 */
const CollapsiblePanel = exports.CollapsiblePanel = /*#__PURE__*/React.forwardRef(function CollapsiblePanel(componentProps, forwardedRef) {
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
    (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
      if (hiddenUntilFoundProp && keepMountedProp === false) {
        (0, _warn.warn)('The `keepMounted={false}` prop on a Collapsible will be ignored when using `hiddenUntilFound` since it requires the Panel to remain mounted even when closed.');
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
  } = (0, _CollapsibleRootContext.useCollapsibleRootContext)();
  const hiddenUntilFound = hiddenUntilFoundProp ?? false;
  const keepMounted = keepMountedProp ?? false;
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
  const {
    props
  } = (0, _useCollapsiblePanel.useCollapsiblePanel)({
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
  (0, _useOpenChangeComplete.useOpenChangeComplete)({
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
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state: panelState,
    ref: [forwardedRef, panelRef],
    props: [props, {
      style: {
        [_CollapsiblePanelCssVars.CollapsiblePanelCssVars.collapsiblePanelHeight]: height === undefined ? 'auto' : `${height}px`,
        [_CollapsiblePanelCssVars.CollapsiblePanelCssVars.collapsiblePanelWidth]: width === undefined ? 'auto' : `${width}px`
      }
    }, elementProps],
    stateAttributesMapping: _stateAttributesMapping.collapsibleStateAttributesMapping
  });
  const shouldRender = keepMounted || hiddenUntilFound || !keepMounted && mounted;
  if (!shouldRender) {
    return null;
  }
  return element;
});
if (process.env.NODE_ENV !== "production") CollapsiblePanel.displayName = "CollapsiblePanel";