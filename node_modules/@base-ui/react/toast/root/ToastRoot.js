"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToastRoot = void 0;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _owner = require("@base-ui/utils/owner");
var _inertValue = require("@base-ui/utils/inertValue");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _utils = require("../../floating-ui-react/utils");
var _ToastRootContext = require("./ToastRootContext");
var _stateAttributesMapping = require("../../utils/stateAttributesMapping");
var _ToastProviderContext = require("../provider/ToastProviderContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _useOpenChangeComplete = require("../../utils/useOpenChangeComplete");
var _ToastRootCssVars = require("./ToastRootCssVars");
var _constants = require("../../utils/constants");
var _jsxRuntime = require("react/jsx-runtime");
const stateAttributesMapping = {
  ..._stateAttributesMapping.transitionStatusMapping,
  swipeDirection(value) {
    return value ? {
      'data-swipe-direction': value
    } : null;
  }
};
const SWIPE_THRESHOLD = 40;
const REVERSE_CANCEL_THRESHOLD = 10;
const OPPOSITE_DIRECTION_DAMPING_FACTOR = 0.5;
const MIN_DRAG_THRESHOLD = 1;
const TOAST_SWIPE_IGNORE_SELECTOR = `${_constants.BASE_UI_SWIPE_IGNORE_SELECTOR},${_constants.LEGACY_SWIPE_IGNORE_SELECTOR}`;
function getDisplacement(direction, deltaX, deltaY) {
  switch (direction) {
    case 'up':
      return -deltaY;
    case 'down':
      return deltaY;
    case 'left':
      return -deltaX;
    case 'right':
      return deltaX;
    default:
      return 0;
  }
}
function getElementTransform(element) {
  const computedStyle = window.getComputedStyle(element);
  const transform = computedStyle.transform;
  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  if (transform && transform !== 'none') {
    const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
    if (matrix) {
      const values = matrix[1].split(', ').map(parseFloat);
      if (values.length === 6) {
        translateX = values[4];
        translateY = values[5];
        scale = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
      } else if (values.length === 16) {
        translateX = values[12];
        translateY = values[13];
        scale = values[0];
      }
    }
  }
  return {
    x: translateX,
    y: translateY,
    scale
  };
}

/**
 * Groups all parts of an individual toast.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Toast](https://base-ui.com/react/components/toast)
 */
const ToastRoot = exports.ToastRoot = /*#__PURE__*/React.forwardRef(function ToastRoot(componentProps, forwardedRef) {
  const {
    toast,
    render,
    className,
    swipeDirection = ['down', 'right'],
    ...elementProps
  } = componentProps;
  const isAnchored = toast.positionerProps?.anchor !== undefined;
  let swipeDirections = [];
  if (!isAnchored) {
    swipeDirections = Array.isArray(swipeDirection) ? swipeDirection : [swipeDirection];
  }
  const swipeEnabled = swipeDirections.length > 0;
  const store = (0, _ToastProviderContext.useToastProviderContext)();
  const [currentSwipeDirection, setCurrentSwipeDirection] = React.useState(undefined);
  const [isSwiping, setIsSwiping] = React.useState(false);
  const [isRealSwipe, setIsRealSwipe] = React.useState(false);
  const [dragDismissed, setDragDismissed] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({
    x: 0,
    y: 0
  });
  const [initialTransform, setInitialTransform] = React.useState({
    x: 0,
    y: 0,
    scale: 1
  });
  const [titleId, setTitleId] = React.useState();
  const [descriptionId, setDescriptionId] = React.useState();
  const [lockedDirection, setLockedDirection] = React.useState(null);
  const rootRef = React.useRef(null);
  const dragStartPosRef = React.useRef({
    x: 0,
    y: 0
  });
  const initialTransformRef = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const intendedSwipeDirectionRef = React.useRef(undefined);
  const maxSwipeDisplacementRef = React.useRef(0);
  const cancelledSwipeRef = React.useRef(false);
  const swipeCancelBaselineRef = React.useRef({
    x: 0,
    y: 0
  });
  const isFirstPointerMoveRef = React.useRef(false);
  const domIndex = store.useState('toastIndex', toast.id);
  const visibleIndex = store.useState('toastVisibleIndex', toast.id);
  const offsetY = store.useState('toastOffsetY', toast.id);
  const focused = store.useState('focused');
  const expanded = store.useState('expanded');
  (0, _useOpenChangeComplete.useOpenChangeComplete)({
    open: toast.transitionStatus !== 'ending',
    ref: rootRef,
    onComplete() {
      if (toast.transitionStatus === 'ending') {
        store.removeToast(toast.id);
      }
    }
  });

  /**
   * Recalculates the natural height of the toast and updates it in the toast manager.
   * @param flushSync Whether to flush the update synchronously. Use in observer
   * callbacks to avoid visual flickers.
   */
  const recalculateHeight = (0, _useStableCallback.useStableCallback)((flushSync = false) => {
    const element = rootRef.current;
    if (!element) {
      return;
    }
    const previousHeight = element.style.height;
    element.style.height = 'auto';
    const height = element.offsetHeight;
    element.style.height = previousHeight;
    function update() {
      store.updateToastInternal(toast.id, {
        ref: rootRef,
        height,
        ...(toast.transitionStatus === 'starting' ? {
          transitionStatus: undefined
        } : {})
      });
    }
    if (flushSync) {
      ReactDOM.flushSync(update);
    } else {
      update();
    }
  });
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(recalculateHeight, [recalculateHeight]);
  function applyDirectionalDamping(deltaX, deltaY) {
    let newDeltaX = deltaX;
    let newDeltaY = deltaY;
    if (!swipeDirections.includes('left') && !swipeDirections.includes('right')) {
      newDeltaX = deltaX > 0 ? deltaX ** OPPOSITE_DIRECTION_DAMPING_FACTOR : -(Math.abs(deltaX) ** OPPOSITE_DIRECTION_DAMPING_FACTOR);
    } else {
      if (!swipeDirections.includes('right') && deltaX > 0) {
        newDeltaX = deltaX ** OPPOSITE_DIRECTION_DAMPING_FACTOR;
      }
      if (!swipeDirections.includes('left') && deltaX < 0) {
        newDeltaX = -(Math.abs(deltaX) ** OPPOSITE_DIRECTION_DAMPING_FACTOR);
      }
    }
    if (!swipeDirections.includes('up') && !swipeDirections.includes('down')) {
      newDeltaY = deltaY > 0 ? deltaY ** OPPOSITE_DIRECTION_DAMPING_FACTOR : -(Math.abs(deltaY) ** OPPOSITE_DIRECTION_DAMPING_FACTOR);
    } else {
      if (!swipeDirections.includes('down') && deltaY > 0) {
        newDeltaY = deltaY ** OPPOSITE_DIRECTION_DAMPING_FACTOR;
      }
      if (!swipeDirections.includes('up') && deltaY < 0) {
        newDeltaY = -(Math.abs(deltaY) ** OPPOSITE_DIRECTION_DAMPING_FACTOR);
      }
    }
    return {
      x: newDeltaX,
      y: newDeltaY
    };
  }
  function handlePointerDown(event) {
    if (event.button !== 0) {
      return;
    }
    if (event.pointerType === 'touch') {
      store.pauseTimers();
    }
    const target = (0, _utils.getTarget)(event.nativeEvent);
    const isInteractiveElement = target ? target.closest(`button,a,input,textarea,[role="button"],${TOAST_SWIPE_IGNORE_SELECTOR}`) : false;
    if (isInteractiveElement) {
      return;
    }
    cancelledSwipeRef.current = false;
    intendedSwipeDirectionRef.current = undefined;
    maxSwipeDisplacementRef.current = 0;
    dragStartPosRef.current = {
      x: event.clientX,
      y: event.clientY
    };
    swipeCancelBaselineRef.current = dragStartPosRef.current;
    if (rootRef.current) {
      const transform = getElementTransform(rootRef.current);
      initialTransformRef.current = transform;
      setInitialTransform(transform);
      setDragOffset({
        x: transform.x,
        y: transform.y
      });
    }
    store.setHovering(true);
    setIsSwiping(true);
    setIsRealSwipe(false);
    setLockedDirection(null);
    isFirstPointerMoveRef.current = true;
    rootRef.current?.setPointerCapture(event.pointerId);
  }
  function handlePointerMove(event) {
    if (!isSwiping) {
      return;
    }

    // Prevent text selection on Safari
    event.preventDefault();
    if (isFirstPointerMoveRef.current) {
      // Adjust the starting position to the current position on the first move
      // to account for the delay between pointerdown and the first pointermove on iOS.
      dragStartPosRef.current = {
        x: event.clientX,
        y: event.clientY
      };
      isFirstPointerMoveRef.current = false;
    }
    const {
      clientY,
      clientX,
      movementX,
      movementY
    } = event;
    if (movementY < 0 && clientY > swipeCancelBaselineRef.current.y || movementY > 0 && clientY < swipeCancelBaselineRef.current.y) {
      swipeCancelBaselineRef.current = {
        x: swipeCancelBaselineRef.current.x,
        y: clientY
      };
    }
    if (movementX < 0 && clientX > swipeCancelBaselineRef.current.x || movementX > 0 && clientX < swipeCancelBaselineRef.current.x) {
      swipeCancelBaselineRef.current = {
        x: clientX,
        y: swipeCancelBaselineRef.current.y
      };
    }
    const deltaX = clientX - dragStartPosRef.current.x;
    const deltaY = clientY - dragStartPosRef.current.y;
    const cancelDeltaY = clientY - swipeCancelBaselineRef.current.y;
    const cancelDeltaX = clientX - swipeCancelBaselineRef.current.x;
    if (!isRealSwipe) {
      const movementDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (movementDistance >= MIN_DRAG_THRESHOLD) {
        setIsRealSwipe(true);
        if (lockedDirection === null) {
          const hasHorizontal = swipeDirections.includes('left') || swipeDirections.includes('right');
          const hasVertical = swipeDirections.includes('up') || swipeDirections.includes('down');
          if (hasHorizontal && hasVertical) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            setLockedDirection(absX > absY ? 'horizontal' : 'vertical');
          }
        }
      }
    }
    let candidate;
    if (!intendedSwipeDirectionRef.current) {
      if (lockedDirection === 'vertical') {
        if (deltaY > 0) {
          candidate = 'down';
        } else if (deltaY < 0) {
          candidate = 'up';
        }
      } else if (lockedDirection === 'horizontal') {
        if (deltaX > 0) {
          candidate = 'right';
        } else if (deltaX < 0) {
          candidate = 'left';
        }
      } else if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        candidate = deltaX > 0 ? 'right' : 'left';
      } else {
        candidate = deltaY > 0 ? 'down' : 'up';
      }
      if (candidate && swipeDirections.includes(candidate)) {
        intendedSwipeDirectionRef.current = candidate;
        maxSwipeDisplacementRef.current = getDisplacement(candidate, deltaX, deltaY);
        setCurrentSwipeDirection(candidate);
      }
    } else {
      const direction = intendedSwipeDirectionRef.current;
      const currentDisplacement = getDisplacement(direction, cancelDeltaX, cancelDeltaY);
      if (currentDisplacement > SWIPE_THRESHOLD) {
        cancelledSwipeRef.current = false;
        setCurrentSwipeDirection(direction);
      } else if (!(swipeDirections.includes('left') && swipeDirections.includes('right')) && !(swipeDirections.includes('up') && swipeDirections.includes('down')) && maxSwipeDisplacementRef.current - currentDisplacement >= REVERSE_CANCEL_THRESHOLD) {
        // Mark that a change-of-mind has occurred
        cancelledSwipeRef.current = true;
      }
    }
    const dampedDelta = applyDirectionalDamping(deltaX, deltaY);
    let newOffsetX = initialTransformRef.current.x;
    let newOffsetY = initialTransformRef.current.y;
    if (lockedDirection === 'horizontal') {
      if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
        newOffsetX += dampedDelta.x;
      }
    } else if (lockedDirection === 'vertical') {
      if (swipeDirections.includes('up') || swipeDirections.includes('down')) {
        newOffsetY += dampedDelta.y;
      }
    } else {
      if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
        newOffsetX += dampedDelta.x;
      }
      if (swipeDirections.includes('up') || swipeDirections.includes('down')) {
        newOffsetY += dampedDelta.y;
      }
    }
    setDragOffset({
      x: newOffsetX,
      y: newOffsetY
    });
  }
  function handlePointerUp(event) {
    if (!isSwiping) {
      return;
    }
    setIsSwiping(false);
    setIsRealSwipe(false);
    setLockedDirection(null);
    rootRef.current?.releasePointerCapture(event.pointerId);
    if (cancelledSwipeRef.current) {
      setDragOffset({
        x: initialTransform.x,
        y: initialTransform.y
      });
      setCurrentSwipeDirection(undefined);
      return;
    }
    let shouldClose = false;
    const deltaX = dragOffset.x - initialTransform.x;
    const deltaY = dragOffset.y - initialTransform.y;
    let dismissDirection;
    for (const direction of swipeDirections) {
      switch (direction) {
        case 'right':
          if (deltaX > SWIPE_THRESHOLD) {
            shouldClose = true;
            dismissDirection = 'right';
          }
          break;
        case 'left':
          if (deltaX < -SWIPE_THRESHOLD) {
            shouldClose = true;
            dismissDirection = 'left';
          }
          break;
        case 'down':
          if (deltaY > SWIPE_THRESHOLD) {
            shouldClose = true;
            dismissDirection = 'down';
          }
          break;
        case 'up':
          if (deltaY < -SWIPE_THRESHOLD) {
            shouldClose = true;
            dismissDirection = 'up';
          }
          break;
        default:
          break;
      }
      if (shouldClose) {
        break;
      }
    }
    if (shouldClose) {
      setCurrentSwipeDirection(dismissDirection);
      setDragDismissed(true);
      store.closeToast(toast.id);
    } else {
      setDragOffset({
        x: initialTransform.x,
        y: initialTransform.y
      });
      setCurrentSwipeDirection(undefined);
    }
  }
  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      if (!rootRef.current || !(0, _utils.contains)(rootRef.current, (0, _utils.activeElement)((0, _owner.ownerDocument)(rootRef.current)))) {
        return;
      }
      store.closeToast(toast.id);
    }
  }
  React.useEffect(() => {
    if (!swipeEnabled) {
      return undefined;
    }
    const element = rootRef.current;
    if (!element) {
      return undefined;
    }
    function preventDefaultTouchStart(event) {
      if ((0, _utils.contains)(element, event.target)) {
        event.preventDefault();
      }
    }
    element.addEventListener('touchmove', preventDefaultTouchStart, {
      passive: false
    });
    return () => {
      element.removeEventListener('touchmove', preventDefaultTouchStart);
    };
  }, [swipeEnabled]);
  function getDragStyles() {
    if (!isSwiping && dragOffset.x === initialTransform.x && dragOffset.y === initialTransform.y && !dragDismissed) {
      return {
        [_ToastRootCssVars.ToastRootCssVars.swipeMovementX]: '0px',
        [_ToastRootCssVars.ToastRootCssVars.swipeMovementY]: '0px'
      };
    }
    const deltaX = dragOffset.x - initialTransform.x;
    const deltaY = dragOffset.y - initialTransform.y;
    return {
      transition: isSwiping ? 'none' : undefined,
      // While swiping, freeze the element at its current visual transform so it doesn't snap to the
      // end position.
      transform: isSwiping ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) scale(${initialTransform.scale})` : undefined,
      [_ToastRootCssVars.ToastRootCssVars.swipeMovementX]: `${deltaX}px`,
      [_ToastRootCssVars.ToastRootCssVars.swipeMovementY]: `${deltaY}px`
    };
  }
  const isHighPriority = toast.priority === 'high';
  const defaultProps = {
    role: isHighPriority ? 'alertdialog' : 'dialog',
    tabIndex: 0,
    'aria-modal': false,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
    'aria-hidden': isHighPriority && !focused ? true : undefined,
    onPointerDown: swipeEnabled ? handlePointerDown : undefined,
    onPointerMove: swipeEnabled ? handlePointerMove : undefined,
    onPointerUp: swipeEnabled ? handlePointerUp : undefined,
    onKeyDown: handleKeyDown,
    inert: (0, _inertValue.inertValue)(toast.limited),
    style: {
      ...getDragStyles(),
      [_ToastRootCssVars.ToastRootCssVars.index]: toast.transitionStatus === 'ending' ? domIndex : visibleIndex,
      [_ToastRootCssVars.ToastRootCssVars.offsetY]: `${offsetY}px`,
      [_ToastRootCssVars.ToastRootCssVars.height]: toast.height ? `${toast.height}px` : undefined
    }
  };
  const toastRoot = React.useMemo(() => ({
    rootRef,
    toast,
    titleId,
    setTitleId,
    descriptionId,
    setDescriptionId,
    swiping: isSwiping,
    swipeDirection: currentSwipeDirection,
    recalculateHeight,
    index: domIndex,
    visibleIndex,
    expanded
  }), [toast, titleId, descriptionId, isSwiping, currentSwipeDirection, recalculateHeight, domIndex, visibleIndex, expanded]);
  const state = {
    transitionStatus: toast.transitionStatus,
    expanded,
    limited: toast.limited || false,
    type: toast.type,
    swiping: toastRoot.swiping,
    swipeDirection: toastRoot.swipeDirection
  };
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [forwardedRef, toastRoot.rootRef],
    state,
    stateAttributesMapping,
    props: [defaultProps, elementProps]
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_ToastRootContext.ToastRootContext.Provider, {
    value: toastRoot,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ToastRoot.displayName = "ToastRoot";