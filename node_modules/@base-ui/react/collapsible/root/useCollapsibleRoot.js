"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useCollapsibleRoot = useCollapsibleRoot;
var React = _interopRequireWildcard(require("react"));
var _useControlled = require("@base-ui/utils/useControlled");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _useAnimationsFinished = require("../../utils/useAnimationsFinished");
var _useTransitionStatus = require("../../utils/useTransitionStatus");
function useCollapsibleRoot(parameters) {
  const {
    open: openParam,
    defaultOpen,
    onOpenChange,
    disabled
  } = parameters;
  const isControlled = openParam !== undefined;
  const [open, setOpen] = (0, _useControlled.useControlled)({
    controlled: openParam,
    default: defaultOpen,
    name: 'Collapsible',
    state: 'open'
  });
  const {
    mounted,
    setMounted,
    transitionStatus
  } = (0, _useTransitionStatus.useTransitionStatus)(open, true, true);
  const [visible, setVisible] = React.useState(open);
  const [{
    height,
    width
  }, setDimensions] = React.useState({
    height: undefined,
    width: undefined
  });
  const defaultPanelId = (0, _useBaseUiId.useBaseUiId)();
  const [panelIdState, setPanelIdState] = React.useState();
  const panelId = panelIdState ?? defaultPanelId;
  const [hiddenUntilFound, setHiddenUntilFound] = React.useState(false);
  const [keepMounted, setKeepMounted] = React.useState(false);
  const abortControllerRef = React.useRef(null);
  const animationTypeRef = React.useRef(null);
  const transitionDimensionRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const runOnceAnimationsFinish = (0, _useAnimationsFinished.useAnimationsFinished)(panelRef, false);
  const handleTrigger = (0, _useStableCallback.useStableCallback)(event => {
    const nextOpen = !open;
    const eventDetails = (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerPress, event.nativeEvent);
    onOpenChange(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    const panel = panelRef.current;
    if (animationTypeRef.current === 'css-animation' && panel != null) {
      panel.style.removeProperty('animation-name');
    }
    if (!hiddenUntilFound && !keepMounted) {
      if (animationTypeRef.current != null && animationTypeRef.current !== 'css-animation') {
        if (!mounted && nextOpen) {
          setMounted(true);
        }
      }
      if (animationTypeRef.current === 'css-animation') {
        if (!visible && nextOpen) {
          setVisible(true);
        }
        if (!mounted && nextOpen) {
          setMounted(true);
        }
      }
    }
    setOpen(nextOpen);
    if (animationTypeRef.current === 'none' && mounted && !nextOpen) {
      setMounted(false);
    }
  });
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    /**
     * Unmount immediately when closing in controlled mode and keepMounted={false}
     * and no CSS animations or transitions are applied
     */
    if (isControlled && animationTypeRef.current === 'none' && !keepMounted && !open) {
      setMounted(false);
    }
  }, [isControlled, keepMounted, open, openParam, setMounted]);
  return React.useMemo(() => ({
    abortControllerRef,
    animationTypeRef,
    disabled,
    handleTrigger,
    height,
    mounted,
    open,
    panelId,
    panelRef,
    runOnceAnimationsFinish,
    setDimensions,
    setHiddenUntilFound,
    setKeepMounted,
    setMounted,
    setOpen,
    setPanelIdState,
    setVisible,
    transitionDimensionRef,
    transitionStatus,
    visible,
    width
  }), [abortControllerRef, animationTypeRef, disabled, handleTrigger, height, mounted, open, panelId, panelRef, runOnceAnimationsFinish, setDimensions, setHiddenUntilFound, setKeepMounted, setMounted, setOpen, setVisible, transitionDimensionRef, transitionStatus, visible, width]);
}