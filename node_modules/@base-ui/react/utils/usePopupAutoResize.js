"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePopupAutoResize = usePopupAutoResize;
var React = _interopRequireWildcard(require("react"));
var _useAnimationFrame = require("@base-ui/utils/useAnimationFrame");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _empty = require("@base-ui/utils/empty");
var _useAnimationsFinished = require("./useAnimationsFinished");
var _getCssDimensions = require("./getCssDimensions");
var _constants = require("./constants");
const DEFAULT_ENABLED = () => true;

/**
 * Allows the element to automatically resize based on its content while supporting animations.
 */
function usePopupAutoResize(parameters) {
  const {
    popupElement,
    positionerElement,
    content,
    mounted,
    enabled = DEFAULT_ENABLED,
    onMeasureLayout: onMeasureLayoutParam,
    onMeasureLayoutComplete: onMeasureLayoutCompleteParam,
    side,
    direction
  } = parameters;
  const runOnceAnimationsFinish = (0, _useAnimationsFinished.useAnimationsFinished)(popupElement, true, false);
  const animationFrame = (0, _useAnimationFrame.useAnimationFrame)();
  const committedDimensionsRef = React.useRef(null);
  const liveDimensionsRef = React.useRef(null);
  const isInitialRenderRef = React.useRef(true);
  const restoreAnchoringStylesRef = React.useRef(_empty.NOOP);
  const onMeasureLayout = (0, _useStableCallback.useStableCallback)(onMeasureLayoutParam);
  const onMeasureLayoutComplete = (0, _useStableCallback.useStableCallback)(onMeasureLayoutCompleteParam);
  const anchoringStyles = React.useMemo(() => {
    // Ensure popup size transitions correctly when anchored to `bottom` (side=top) or `right` (side=left).
    let isOriginSide = side === 'top';
    let isPhysicalLeft = side === 'left';
    if (direction === 'rtl') {
      isOriginSide = isOriginSide || side === 'inline-end';
      isPhysicalLeft = isPhysicalLeft || side === 'inline-end';
    } else {
      isOriginSide = isOriginSide || side === 'inline-start';
      isPhysicalLeft = isPhysicalLeft || side === 'inline-start';
    }
    return isOriginSide ? {
      position: 'absolute',
      [side === 'top' ? 'bottom' : 'top']: '0',
      [isPhysicalLeft ? 'right' : 'left']: '0'
    } : _constants.EMPTY_OBJECT;
  }, [side, direction]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    // Reset the state when the popup is closed.
    if (!mounted || !enabled() || typeof ResizeObserver !== 'function') {
      restoreAnchoringStylesRef.current = _empty.NOOP;
      isInitialRenderRef.current = true;
      committedDimensionsRef.current = null;
      liveDimensionsRef.current = null;
      return undefined;
    }
    if (!popupElement || !positionerElement) {
      return undefined;
    }
    restoreAnchoringStylesRef.current = applyElementStyles(popupElement, anchoringStyles);
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        liveDimensionsRef.current = {
          width: Math.ceil(entry.borderBoxSize[0].inlineSize),
          height: Math.ceil(entry.borderBoxSize[0].blockSize)
        };
      }
    });
    observer.observe(popupElement);

    // Measure the rendered size to enable transitions:
    setPopupCssSize(popupElement, 'auto');
    const restorePopupPosition = overrideElementStyle(popupElement, 'position', 'static');
    const restorePopupTransform = overrideElementStyle(popupElement, 'transform', 'none');
    const restorePopupScale = overrideElementStyle(popupElement, 'scale', '1');
    const restorePositionerAvailableSize = applyElementStyles(positionerElement, {
      '--available-width': 'max-content',
      '--available-height': 'max-content'
    });
    function restoreMeasurementOverrides() {
      restorePopupPosition();
      restorePopupTransform();
      restorePositionerAvailableSize();
    }
    function restoreMeasurementOverridesIncludingScale() {
      restoreMeasurementOverrides();
      restorePopupScale();
    }
    onMeasureLayout?.();

    // Initial render (for each time the popup opens).
    if (isInitialRenderRef.current || committedDimensionsRef.current === null) {
      setPositionerCssSize(positionerElement, 'max-content');
      const dimensions = (0, _getCssDimensions.getCssDimensions)(popupElement);
      committedDimensionsRef.current = dimensions;
      setPositionerCssSize(positionerElement, dimensions);
      restoreMeasurementOverridesIncludingScale();
      onMeasureLayoutComplete?.(null, dimensions);
      isInitialRenderRef.current = false;
      return () => {
        observer.disconnect();
        restoreAnchoringStylesRef.current();
        restoreAnchoringStylesRef.current = _empty.NOOP;
      };
    }

    // Subsequent renders while open (when `content` changes).
    setPopupCssSize(popupElement, 'auto');
    setPositionerCssSize(positionerElement, 'max-content');
    const previousDimensions = committedDimensionsRef.current ?? liveDimensionsRef.current;
    const newDimensions = (0, _getCssDimensions.getCssDimensions)(popupElement);

    // Commit immediately so future content changes have a stable previous size, even if
    // ResizeObserver runs after this point.
    committedDimensionsRef.current = newDimensions;
    if (!previousDimensions) {
      setPositionerCssSize(positionerElement, newDimensions);
      restoreMeasurementOverridesIncludingScale();
      onMeasureLayoutComplete?.(null, newDimensions);
      return () => {
        observer.disconnect();
        animationFrame.cancel();
        restoreAnchoringStylesRef.current();
        restoreAnchoringStylesRef.current = _empty.NOOP;
      };
    }
    setPopupCssSize(popupElement, previousDimensions);
    restoreMeasurementOverridesIncludingScale();
    onMeasureLayoutComplete?.(previousDimensions, newDimensions);
    setPositionerCssSize(positionerElement, newDimensions);
    const abortController = new AbortController();
    animationFrame.request(() => {
      setPopupCssSize(popupElement, newDimensions);
      runOnceAnimationsFinish(() => {
        popupElement.style.setProperty('--popup-width', 'auto');
        popupElement.style.setProperty('--popup-height', 'auto');
      }, abortController.signal);
    });
    return () => {
      observer.disconnect();
      abortController.abort();
      animationFrame.cancel();
      restoreAnchoringStylesRef.current();
      restoreAnchoringStylesRef.current = _empty.NOOP;
    };
  }, [content, popupElement, positionerElement, runOnceAnimationsFinish, animationFrame, enabled, mounted, onMeasureLayout, onMeasureLayoutComplete, anchoringStyles]);
}
function overrideElementStyle(element, property, value) {
  const originalValue = element.style.getPropertyValue(property);
  element.style.setProperty(property, value);
  return () => {
    element.style.setProperty(property, originalValue);
  };
}
function applyElementStyles(element, styles) {
  const restorers = [];
  for (const [key, value] of Object.entries(styles)) {
    restorers.push(overrideElementStyle(element, key, value));
  }
  return restorers.length ? () => {
    restorers.forEach(restore => restore());
  } : _empty.NOOP;
}
function setPopupCssSize(popupElement, size) {
  const width = size === 'auto' ? 'auto' : `${size.width}px`;
  const height = size === 'auto' ? 'auto' : `${size.height}px`;
  popupElement.style.setProperty('--popup-width', width);
  popupElement.style.setProperty('--popup-height', height);
}
function setPositionerCssSize(positionerElement, size) {
  const width = size === 'max-content' ? 'max-content' : `${size.width}px`;
  const height = size === 'max-content' ? 'max-content' : `${size.height}px`;
  positionerElement.style.setProperty('--positioner-width', width);
  positionerElement.style.setProperty('--positioner-height', height);
}