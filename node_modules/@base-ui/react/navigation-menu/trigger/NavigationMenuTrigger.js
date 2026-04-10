"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavigationMenuTrigger = void 0;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _dom = require("@floating-ui/utils/dom");
var _tabbable = require("tabbable");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _owner = require("@base-ui/utils/owner");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _useAnimationFrame = require("@base-ui/utils/useAnimationFrame");
var _useValueAsRef = require("@base-ui/utils/useValueAsRef");
var _detectBrowser = require("@base-ui/utils/detectBrowser");
var _floatingUiReact = require("../../floating-ui-react");
var _useHoverInteractionSharedState = require("../../floating-ui-react/hooks/useHoverInteractionSharedState");
var _utils = require("../../floating-ui-react/utils");
var _NavigationMenuItemContext = require("../item/NavigationMenuItemContext");
var _NavigationMenuRootContext = require("../root/NavigationMenuRootContext");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _constants = require("../../utils/constants");
var _FocusGuard = require("../../utils/FocusGuard");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _stateAttributesMapping = require("../../utils/stateAttributesMapping");
var _isOutsideMenuEvent = require("../utils/isOutsideMenuEvent");
var _CompositeItem = require("../../composite/item/CompositeItem");
var _useButton = require("../../use-button");
var _useAnimationsFinished = require("../../utils/useAnimationsFinished");
var _getCssDimensions = require("../../utils/getCssDimensions");
var _constants2 = require("../utils/constants");
var _NavigationMenuDismissContext = require("../list/NavigationMenuDismissContext");
var _NavigationMenuPopupCssVars = require("../popup/NavigationMenuPopupCssVars");
var _NavigationMenuPositionerCssVars = require("../positioner/NavigationMenuPositionerCssVars");
var _jsxRuntime = require("react/jsx-runtime");
const DEFAULT_SIZE = {
  width: 0,
  height: 0
};

/**
 * Opens the navigation menu popup when hovered or clicked, revealing the
 * associated content.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Navigation Menu](https://base-ui.com/react/components/navigation-menu)
 */
const NavigationMenuTrigger = exports.NavigationMenuTrigger = /*#__PURE__*/React.forwardRef(function NavigationMenuTrigger(componentProps, forwardedRef) {
  const {
    className,
    render,
    nativeButton = true,
    disabled,
    ...elementProps
  } = componentProps;
  const {
    value,
    setValue,
    mounted,
    open,
    positionerElement,
    setActivationDirection,
    setFloatingRootContext,
    popupElement,
    viewportElement,
    transitionStatus,
    rootRef,
    beforeOutsideRef,
    afterOutsideRef,
    afterInsideRef,
    beforeInsideRef,
    prevTriggerElementRef,
    currentContentRef,
    delay,
    closeDelay,
    orientation,
    setViewportInert,
    nested
  } = (0, _NavigationMenuRootContext.useNavigationMenuRootContext)();
  const {
    value: itemValue
  } = (0, _NavigationMenuItemContext.useNavigationMenuItemContext)();
  const nodeId = (0, _NavigationMenuRootContext.useNavigationMenuTreeContext)();
  const tree = (0, _floatingUiReact.useFloatingTree)();
  const dismissProps = (0, _NavigationMenuDismissContext.useNavigationMenuDismissContext)();
  const stickIfOpenTimeout = (0, _useTimeout.useTimeout)();
  const focusFrame = (0, _useAnimationFrame.useAnimationFrame)();
  const mutationFrame = (0, _useAnimationFrame.useAnimationFrame)();
  const resizeFrame = (0, _useAnimationFrame.useAnimationFrame)();
  const sizeFrame = (0, _useAnimationFrame.useAnimationFrame)();
  const [triggerElement, setTriggerElement] = React.useState(null);
  const [stickIfOpen, setStickIfOpen] = React.useState(true);
  const [pointerType, setPointerType] = React.useState('');
  const triggerElementRef = React.useRef(null);
  const allowFocusRef = React.useRef(false);
  const prevSizeRef = React.useRef(DEFAULT_SIZE);
  const animationAbortControllerRef = React.useRef(null);
  const skipAutoSizeSyncRef = React.useRef(false);
  const isActiveItem = open && value === itemValue;
  const isActiveItemRef = (0, _useValueAsRef.useValueAsRef)(isActiveItem);
  const interactionsEnabled = positionerElement ? true : !value;
  const hoverFloatingElement = positionerElement || viewportElement;
  const hoverInteractionsEnabled = hoverFloatingElement ? true : !value;
  const runOnceAnimationsFinish = (0, _useAnimationsFinished.useAnimationsFinished)(popupElement, false, false);
  const handleTriggerElement = React.useCallback(element => {
    triggerElementRef.current = element;
    setTriggerElement(element);
  }, []);
  React.useEffect(() => {
    animationAbortControllerRef.current?.abort();
  }, [isActiveItem]);
  function setAutoSizes() {
    if (!popupElement) {
      return;
    }
    popupElement.style.setProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupWidth, 'auto');
    popupElement.style.setProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupHeight, 'auto');
  }
  function clearFixedSizes() {
    if (!popupElement || !positionerElement) {
      return;
    }
    popupElement.style.removeProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupWidth);
    popupElement.style.removeProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupHeight);
    positionerElement.style.removeProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerWidth);
    positionerElement.style.removeProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerHeight);
  }
  function setSharedFixedSizes(width, height) {
    if (!popupElement || !positionerElement) {
      return;
    }
    popupElement.style.setProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupWidth, `${width}px`);
    popupElement.style.setProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupHeight, `${height}px`);
    positionerElement.style.setProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerWidth, `${width}px`);
    positionerElement.style.setProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerHeight, `${height}px`);
  }
  function scheduleAutoSizeReset() {
    animationAbortControllerRef.current = new AbortController();
    runOnceAnimationsFinish(setAutoSizes, animationAbortControllerRef.current.signal);
  }
  const handleValueChange = (0, _useStableCallback.useStableCallback)((currentWidth, currentHeight, options = {}) => {
    if (!popupElement || !positionerElement) {
      return;
    }
    const {
      syncPositioner = false
    } = options;
    clearFixedSizes();
    const {
      width,
      height
    } = (0, _getCssDimensions.getCssDimensions)(popupElement);
    const measuredWidth = width || prevSizeRef.current.width;
    const measuredHeight = height || prevSizeRef.current.height;
    if (currentHeight === 0 || currentWidth === 0) {
      currentWidth = measuredWidth;
      currentHeight = measuredHeight;
    }
    popupElement.style.setProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupWidth, `${currentWidth}px`);
    popupElement.style.setProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupHeight, `${currentHeight}px`);
    positionerElement.style.setProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerWidth, `${syncPositioner ? currentWidth : measuredWidth}px`);
    positionerElement.style.setProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerHeight, `${syncPositioner ? currentHeight : measuredHeight}px`);
    sizeFrame.request(() => {
      popupElement.style.setProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupWidth, `${measuredWidth}px`);
      popupElement.style.setProperty(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupHeight, `${measuredHeight}px`);
      if (syncPositioner) {
        positionerElement.style.setProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerWidth, `${measuredWidth}px`);
        positionerElement.style.setProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerHeight, `${measuredHeight}px`);
      }
      scheduleAutoSizeReset();
    });
  });
  const handleInterruptedMutationResize = (0, _useStableCallback.useStableCallback)((currentWidth, currentHeight) => {
    if (!popupElement || !positionerElement) {
      return;
    }
    sizeFrame.cancel();
    mutationFrame.cancel();
    animationAbortControllerRef.current?.abort();
    animationAbortControllerRef.current = null;
    if (currentWidth === 0 || currentHeight === 0) {
      return;
    }
    setSharedFixedSizes(currentWidth, currentHeight);
    mutationFrame.request(() => {
      mutationFrame.request(() => {
        clearFixedSizes();
        const {
          width,
          height
        } = (0, _getCssDimensions.getCssDimensions)(popupElement);
        const measuredWidth = width || currentWidth || prevSizeRef.current.width;
        const measuredHeight = height || currentHeight || prevSizeRef.current.height;
        setSharedFixedSizes(currentWidth, currentHeight);
        sizeFrame.request(() => {
          setSharedFixedSizes(measuredWidth, measuredHeight);
          scheduleAutoSizeReset();
        });
      });
    });
  });
  const syncCurrentSize = (0, _useStableCallback.useStableCallback)(() => {
    if (!popupElement || !positionerElement) {
      return;
    }
    sizeFrame.cancel();
    animationAbortControllerRef.current?.abort();
    animationAbortControllerRef.current = null;
    clearFixedSizes();
    const {
      width,
      height
    } = (0, _getCssDimensions.getCssDimensions)(popupElement);
    if (width === 0 || height === 0) {
      return;
    }
    prevSizeRef.current = {
      width,
      height
    };
    setAutoSizes();
    positionerElement.style.setProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerWidth, `${width}px`);
    positionerElement.style.setProperty(_NavigationMenuPositionerCssVars.NavigationMenuPositionerCssVars.positionerHeight, `${height}px`);
  });
  const getMutationBaseline = (0, _useStableCallback.useStableCallback)(() => {
    if (!popupElement) {
      return {
        size: prevSizeRef.current,
        syncPositioner: false
      };
    }
    const popupWidth = popupElement.style.getPropertyValue(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupWidth);
    const popupHeight = popupElement.style.getPropertyValue(_NavigationMenuPopupCssVars.NavigationMenuPopupCssVars.popupHeight);
    const isResizing = popupWidth !== '' && popupWidth !== 'auto' && popupHeight !== '' && popupHeight !== 'auto';
    if (!isResizing) {
      return {
        size: prevSizeRef.current,
        syncPositioner: false
      };
    }
    return {
      size: {
        width: popupElement.offsetWidth || prevSizeRef.current.width,
        height: popupElement.offsetHeight || prevSizeRef.current.height
      },
      syncPositioner: true
    };
  });
  React.useEffect(() => {
    if (!open) {
      stickIfOpenTimeout.clear();
      mutationFrame.cancel();
      resizeFrame.cancel();
      sizeFrame.cancel();
      animationAbortControllerRef.current?.abort();
      animationAbortControllerRef.current = null;
      skipAutoSizeSyncRef.current = false;
      setPointerType('');
    }
  }, [stickIfOpenTimeout, open, mutationFrame, resizeFrame, sizeFrame]);
  React.useEffect(() => {
    if (!mounted) {
      prevSizeRef.current = DEFAULT_SIZE;
    }
  }, [mounted]);
  React.useEffect(() => {
    if (!popupElement || typeof ResizeObserver !== 'function') {
      return undefined;
    }
    const resizeObserver = new ResizeObserver(() => {
      prevSizeRef.current = {
        width: popupElement.offsetWidth,
        height: popupElement.offsetHeight
      };
    });
    resizeObserver.observe(popupElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [popupElement]);
  React.useEffect(() => {
    if (!open || !isActiveItem || !popupElement || !positionerElement) {
      return undefined;
    }
    const win = (0, _owner.ownerWindow)(positionerElement);
    function handleResize() {
      resizeFrame.cancel();
      resizeFrame.request(syncCurrentSize);
    }
    win.addEventListener('resize', handleResize);
    return () => {
      resizeFrame.cancel();
      win.removeEventListener('resize', handleResize);
    };
  }, [open, isActiveItem, popupElement, positionerElement, resizeFrame, syncCurrentSize]);
  React.useEffect(() => {
    const observedElement = currentContentRef.current;
    if (!observedElement || !popupElement || !isActiveItem || typeof MutationObserver !== 'function') {
      return undefined;
    }
    const mutationObserver = new MutationObserver(() => {
      if (transitionStatus === 'starting' || popupElement.hasAttribute(_stateAttributesMapping.TransitionStatusDataAttributes.startingStyle)) {
        syncCurrentSize();
        return;
      }
      const {
        size,
        syncPositioner
      } = getMutationBaseline();
      if (syncPositioner) {
        handleInterruptedMutationResize(size.width, size.height);
        return;
      }
      handleValueChange(size.width, size.height);
    });
    mutationObserver.observe(observedElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
    return () => {
      mutationObserver.disconnect();
    };
  }, [currentContentRef, popupElement, isActiveItem, transitionStatus, getMutationBaseline, handleInterruptedMutationResize, handleValueChange, syncCurrentSize]);
  React.useEffect(() => {
    if (isActiveItem && open && popupElement && allowFocusRef.current) {
      allowFocusRef.current = false;
      focusFrame.request(() => {
        beforeOutsideRef.current?.focus();
      });
    }
    return () => {
      focusFrame.cancel();
    };
  }, [beforeOutsideRef, focusFrame, isActiveItem, open, popupElement]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (isActiveItemRef.current && open && popupElement) {
      if (transitionStatus === 'starting') {
        const hasNestedMenu = currentContentRef.current?.querySelector('[data-nested]') != null;
        if (hasNestedMenu) {
          sizeFrame.request(syncCurrentSize);
          return () => {
            sizeFrame.cancel();
          };
        }
      }
      if (skipAutoSizeSyncRef.current) {
        skipAutoSizeSyncRef.current = false;
        return undefined;
      }
      handleValueChange(0, 0);
    }
    return undefined;
  }, [currentContentRef, handleValueChange, isActiveItemRef, open, popupElement, sizeFrame, syncCurrentSize, transitionStatus]);
  function handleOpenChange(nextOpen, eventDetails) {
    const isHover = eventDetails.reason === _reasons.REASONS.triggerHover;
    if (!interactionsEnabled) {
      return;
    }
    if (pointerType === 'touch' && isHover) {
      return;
    }
    if (!nextOpen && value !== itemValue) {
      return;
    }
    function changeState() {
      if (isHover) {
        // Only allow "patient" clicks to close the popup if it's open.
        // If they clicked within 500ms of the popup opening, keep it open.
        setStickIfOpen(true);
        stickIfOpenTimeout.clear();
        stickIfOpenTimeout.start(_constants.PATIENT_CLICK_THRESHOLD, () => {
          setStickIfOpen(false);
        });
      }
      if (nextOpen) {
        setValue(itemValue, eventDetails);
      } else {
        setValue(null, eventDetails);
        setPointerType('');
      }
    }
    if (isHover) {
      ReactDOM.flushSync(changeState);
    } else {
      changeState();
    }
  }
  const context = (0, _floatingUiReact.useFloatingRootContext)({
    open,
    onOpenChange: handleOpenChange,
    elements: {
      reference: triggerElement,
      floating: hoverFloatingElement
    }
  });
  const hoverInteractionState = (0, _useHoverInteractionSharedState.useHoverInteractionSharedState)(context);
  React.useEffect(() => {
    if (!open) {
      context.context.dataRef.current.openEvent = undefined;
      hoverInteractionState.pointerType = undefined;
      hoverInteractionState.interactedInside = false;
      hoverInteractionState.restTimeoutPending = false;
      hoverInteractionState.openChangeTimeout.clear();
      hoverInteractionState.restTimeout.clear();
      (0, _useHoverInteractionSharedState.clearSafePolygonPointerEventsMutation)(hoverInteractionState);
    }
  }, [context, hoverInteractionState, open]);
  const getInlineHandleCloseContext = (0, _useStableCallback.useStableCallback)(() => {
    if (!nested || positionerElement || !triggerElementRef.current || !hoverFloatingElement) {
      return null;
    }
    return getHandleCloseContext(triggerElementRef.current, hoverFloatingElement, nodeId);
  });
  function getScope() {
    return triggerElementRef.current?.closest('ul') ?? null;
  }
  const hoverProps = (0, _floatingUiReact.useHoverReferenceInteraction)(context, {
    enabled: hoverInteractionsEnabled,
    move: false,
    handleClose: (0, _floatingUiReact.safePolygon)({
      blockPointerEvents: pointerType !== 'touch' && (!_detectBrowser.isWebKit || nested),
      getScope
    }),
    restMs: mounted && positionerElement ? 0 : delay,
    delay: {
      close: closeDelay
    },
    triggerElementRef,
    getHandleCloseContext: getInlineHandleCloseContext
  });
  const hover = React.useMemo(() => hoverProps ? {
    reference: hoverProps
  } : undefined, [hoverProps]);
  const click = (0, _floatingUiReact.useClick)(context, {
    enabled: interactionsEnabled,
    stickIfOpen,
    toggle: isActiveItem
  });
  const {
    getReferenceProps
  } = (0, _floatingUiReact.useInteractions)([hover, click]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (isActiveItem) {
      setFloatingRootContext(context);
      prevTriggerElementRef.current = triggerElement;
    }
  }, [isActiveItem, context, setFloatingRootContext, prevTriggerElementRef, triggerElement]);
  function handleActivation(event) {
    ReactDOM.flushSync(() => {
      const prevTriggerRect = prevTriggerElementRef.current?.getBoundingClientRect();
      if (mounted && prevTriggerRect && triggerElement) {
        const nextTriggerRect = triggerElement.getBoundingClientRect();
        const isMovingRight = nextTriggerRect.left > prevTriggerRect.left;
        const isMovingDown = nextTriggerRect.top > prevTriggerRect.top;
        if (orientation === 'horizontal' && nextTriggerRect.left !== prevTriggerRect.left) {
          setActivationDirection(isMovingRight ? 'right' : 'left');
        } else if (orientation === 'vertical' && nextTriggerRect.top !== prevTriggerRect.top) {
          setActivationDirection(isMovingDown ? 'down' : 'up');
        }
      }

      // Reset the `openEvent` to `undefined` when the active item changes so that a
      // `click` -> `hover` on new trigger -> `hover` back to old trigger doesn't unexpectedly
      // cause the popup to remain stuck open when leaving the old trigger.
      if (event.type !== 'click' && value != null) {
        context.context.dataRef.current.openEvent = undefined;
      }
      if (pointerType === 'touch' && event.type !== 'click') {
        return;
      }
      if (value != null) {
        setValue(itemValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(event.type === 'mouseenter' ? _reasons.REASONS.triggerHover : _reasons.REASONS.triggerPress, event.nativeEvent));
      }
      if (event.type === 'mouseenter' && nested && !positionerElement && pointerType !== 'touch' && hoverFloatingElement && (0, _dom.isHTMLElement)(event.currentTarget)) {
        const scopeElement = getScope();
        if (!scopeElement) {
          return;
        }
        (0, _useHoverInteractionSharedState.applySafePolygonPointerEventsMutation)(hoverInteractionState, {
          scopeElement,
          referenceElement: event.currentTarget,
          floatingElement: hoverFloatingElement
        });
      }
    });
  }
  const handleOpenEvent = (0, _useStableCallback.useStableCallback)(event => {
    if (!popupElement || !positionerElement) {
      handleActivation(event);
      return;
    }
    const {
      width,
      height
    } = (0, _getCssDimensions.getCssDimensions)(popupElement);
    const shouldSkipAutoSizeSync = value != null && value !== itemValue && (event.type === 'click' || pointerType !== 'touch');
    handleActivation(event);
    if (shouldSkipAutoSizeSync) {
      skipAutoSizeSyncRef.current = true;
    }
    handleValueChange(width, height);
  });
  const state = {
    open: isActiveItem
  };
  function handleSetPointerType(event) {
    setPointerType(event.pointerType);
  }
  const defaultProps = {
    tabIndex: 0,
    onMouseEnter: handleOpenEvent,
    onClick: handleOpenEvent,
    onPointerEnter: handleSetPointerType,
    onPointerDown: handleSetPointerType,
    'aria-expanded': isActiveItem,
    'aria-controls': isActiveItem ? popupElement?.id : undefined,
    [_constants2.NAVIGATION_MENU_TRIGGER_IDENTIFIER]: '',
    onFocus() {
      if (!isActiveItem) {
        return;
      }
      setViewportInert(false);
    },
    onMouseMove() {
      allowFocusRef.current = false;
    },
    onKeyDown(event) {
      allowFocusRef.current = true;

      // For nested (submenu) triggers, don't intercept arrow keys that are used for
      // navigation in the parent content. The arrow keys should be handled by the
      // parent's CompositeRoot for navigating between items.
      if (nested) {
        return;
      }
      const openHorizontal = orientation === 'horizontal' && event.key === 'ArrowDown';
      const openVertical = orientation === 'vertical' && event.key === 'ArrowRight';
      if (openHorizontal || openVertical) {
        setValue(itemValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.listNavigation, event.nativeEvent));
        handleOpenEvent(event);
        (0, _utils.stopEvent)(event);
      }
    },
    onBlur(event) {
      if (positionerElement && popupElement && (0, _isOutsideMenuEvent.isOutsideMenuEvent)({
        currentTarget: event.currentTarget,
        relatedTarget: event.relatedTarget
      }, {
        popupElement,
        rootRef,
        tree,
        nodeId
      })) {
        setValue(null, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.focusOut, event.nativeEvent));
      }
    }
  };
  const {
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton
  });
  const referenceElement = hoverFloatingElement;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeItem.CompositeItem, {
      tag: "button",
      render: render,
      className: className,
      state: state,
      stateAttributesMapping: _popupStateMapping.pressableTriggerOpenStateMapping,
      refs: [forwardedRef, handleTriggerElement, buttonRef],
      props: [getReferenceProps, dismissProps?.reference || _constants.EMPTY_ARRAY, defaultProps, elementProps, getButtonProps]
    }), isActiveItem && /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
        ref: beforeOutsideRef,
        onFocus: event => {
          if (referenceElement && (0, _utils.isOutsideEvent)(event, referenceElement)) {
            beforeInsideRef.current?.focus();
          } else {
            const prevTabbable = (0, _utils.getPreviousTabbable)(triggerElement);
            prevTabbable?.focus();
          }
        }
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        "aria-owns": viewportElement?.id,
        style: _constants.ownerVisuallyHidden
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
        ref: afterOutsideRef,
        onFocus: event => {
          if (referenceElement && (0, _utils.isOutsideEvent)(event, referenceElement)) {
            const elementToFocus = afterInsideRef.current && (0, _tabbable.isTabbable)(afterInsideRef.current) ? afterInsideRef.current : triggerElement;
            elementToFocus?.focus();
          } else {
            let nextTabbable = (0, _utils.getNextTabbable)(triggerElement);
            if (nested && !positionerElement && referenceElement && nextTabbable && (0, _utils.contains)(referenceElement, nextTabbable)) {
              nextTabbable = (0, _utils.getTabbableAfterElement)(afterInsideRef.current);
            }
            nextTabbable?.focus();
            if ((!nested || positionerElement) && !(0, _utils.contains)(rootRef.current, nextTabbable)) {
              setValue(null, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.focusOut, event.nativeEvent));
            }
          }
        }
      })]
    })]
  });
});
if (process.env.NODE_ENV !== "production") NavigationMenuTrigger.displayName = "NavigationMenuTrigger";
function getPlacementFromElements(domReferenceElement, floatingElement) {
  const referenceRect = domReferenceElement.getBoundingClientRect();
  const floatingRect = floatingElement.getBoundingClientRect();
  const referenceCenterX = referenceRect.left + referenceRect.width / 2;
  const referenceCenterY = referenceRect.top + referenceRect.height / 2;
  const floatingCenterX = floatingRect.left + floatingRect.width / 2;
  const floatingCenterY = floatingRect.top + floatingRect.height / 2;
  const deltaX = floatingCenterX - referenceCenterX;
  const deltaY = floatingCenterY - referenceCenterY;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0 ? 'right' : 'left';
  }
  return deltaY >= 0 ? 'bottom' : 'top';
}
function getHandleCloseContext(domReferenceElement, floatingElement, nodeId) {
  return {
    placement: getPlacementFromElements(domReferenceElement, floatingElement),
    elements: {
      domReference: domReferenceElement,
      floating: floatingElement
    },
    nodeId
  };
}