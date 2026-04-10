"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FloatingFocusManager = FloatingFocusManager;
var React = _interopRequireWildcard(require("react"));
var _tabbable = require("tabbable");
var _dom = require("@floating-ui/utils/dom");
var _useMergedRefs = require("@base-ui/utils/useMergedRefs");
var _useValueAsRef = require("@base-ui/utils/useValueAsRef");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _detectBrowser = require("@base-ui/utils/detectBrowser");
var _useAnimationFrame = require("@base-ui/utils/useAnimationFrame");
var _owner = require("@base-ui/utils/owner");
var _FocusGuard = require("../../utils/FocusGuard");
var _utils = require("../utils");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _createAttribute = require("../utils/createAttribute");
var _enqueueFocus = require("../utils/enqueueFocus");
var _markOthers = require("../utils/markOthers");
var _FloatingPortal = require("./FloatingPortal");
var _FloatingTree = require("./FloatingTree");
var _constants = require("../../utils/constants");
var _resolveRef = require("../../utils/resolveRef");
var _jsxRuntime = require("react/jsx-runtime");
function getEventType(event, lastInteractionType) {
  const win = (0, _owner.ownerWindow)(event.target);
  if (event instanceof win.KeyboardEvent) {
    return 'keyboard';
  }
  if (event instanceof win.FocusEvent) {
    // Focus events can be caused by a preceding pointer interaction (e.g., focusout on outside press).
    // Prefer the last known pointer type if provided, else treat as keyboard.
    return lastInteractionType || 'keyboard';
  }
  if ('pointerType' in event) {
    return event.pointerType || 'keyboard';
  }
  if ('touches' in event) {
    return 'touch';
  }
  if (event instanceof win.MouseEvent) {
    // onClick events may not contain pointer events, and will fall through to here
    return lastInteractionType || (event.detail === 0 ? 'keyboard' : 'mouse');
  }
  return '';
}
const LIST_LIMIT = 20;
let previouslyFocusedElements = [];
function clearDisconnectedPreviouslyFocusedElements() {
  previouslyFocusedElements = previouslyFocusedElements.filter(entry => {
    return entry.deref()?.isConnected;
  });
}
function addPreviouslyFocusedElement(element) {
  clearDisconnectedPreviouslyFocusedElements();
  if (element && (0, _dom.getNodeName)(element) !== 'body') {
    previouslyFocusedElements.push(new WeakRef(element));
    if (previouslyFocusedElements.length > LIST_LIMIT) {
      previouslyFocusedElements = previouslyFocusedElements.slice(-LIST_LIMIT);
    }
  }
}
function getPreviouslyFocusedElement() {
  clearDisconnectedPreviouslyFocusedElements();
  return previouslyFocusedElements[previouslyFocusedElements.length - 1]?.deref();
}
function getFirstTabbableElement(container) {
  if (!container) {
    return null;
  }
  const tabbableOptions = (0, _utils.getTabbableOptions)();
  if ((0, _tabbable.isTabbable)(container, tabbableOptions)) {
    return container;
  }
  return (0, _tabbable.tabbable)(container, tabbableOptions)[0] || container;
}
function isFocusable(element) {
  if (!element || !element.isConnected) {
    return false;
  }
  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility();
  }
  return (0, _utils.isElementVisible)(element);
}
function handleTabIndex(floatingFocusElement, orderRef) {
  if (!orderRef.current.includes('floating') && !floatingFocusElement.getAttribute('role')?.includes('dialog')) {
    return;
  }
  const options = (0, _utils.getTabbableOptions)();
  const focusableElements = (0, _tabbable.focusable)(floatingFocusElement, options);
  const tabbableContent = focusableElements.filter(element => {
    const dataTabIndex = element.getAttribute('data-tabindex') || '';
    return (0, _tabbable.isTabbable)(element, options) || element.hasAttribute('data-tabindex') && !dataTabIndex.startsWith('-');
  });
  const tabIndex = floatingFocusElement.getAttribute('tabindex');
  if (orderRef.current.includes('floating') || tabbableContent.length === 0) {
    if (tabIndex !== '0') {
      floatingFocusElement.setAttribute('tabindex', '0');
    }
  } else if (tabIndex !== '-1' || floatingFocusElement.hasAttribute('data-tabindex') && floatingFocusElement.getAttribute('data-tabindex') !== '-1') {
    floatingFocusElement.setAttribute('tabindex', '-1');
    floatingFocusElement.setAttribute('data-tabindex', '-1');
  }
}
/**
 * Provides focus management for the floating element.
 * @see https://floating-ui.com/docs/FloatingFocusManager
 * @internal
 */
function FloatingFocusManager(props) {
  const {
    context,
    children,
    disabled = false,
    initialFocus = true,
    returnFocus = true,
    restoreFocus = false,
    modal = true,
    closeOnFocusOut = true,
    openInteractionType = '',
    nextFocusableElement,
    previousFocusableElement,
    beforeContentFocusGuardRef,
    externalTree,
    getInsideElements
  } = props;
  const store = 'rootStore' in context ? context.rootStore : context;
  const open = store.useState('open');
  const domReference = store.useState('domReferenceElement');
  const floating = store.useState('floatingElement');
  const {
    events,
    dataRef
  } = store.context;
  const getNodeId = (0, _useStableCallback.useStableCallback)(() => dataRef.current.floatingContext?.nodeId);
  const ignoreInitialFocus = initialFocus === false;
  // If the reference is a combobox and is typeable (e.g. input/textarea),
  // there are different focus semantics. The guards should not be rendered, but
  // aria-hidden should be applied to all nodes still. Further, the visually
  // hidden dismiss button should only appear at the end of the list, not the
  // start.
  const isUntrappedTypeableCombobox = (0, _utils.isTypeableCombobox)(domReference) && ignoreInitialFocus;
  const orderRef = React.useRef(['content']);
  const initialFocusRef = (0, _useValueAsRef.useValueAsRef)(initialFocus);
  const returnFocusRef = (0, _useValueAsRef.useValueAsRef)(returnFocus);
  const openInteractionTypeRef = (0, _useValueAsRef.useValueAsRef)(openInteractionType);
  const tree = (0, _FloatingTree.useFloatingTree)(externalTree);
  const portalContext = (0, _FloatingPortal.usePortalContext)();
  const preventReturnFocusRef = React.useRef(false);
  const isPointerDownRef = React.useRef(false);
  const pointerDownOutsideRef = React.useRef(false);
  const tabbableIndexRef = React.useRef(-1);
  const closeTypeRef = React.useRef('');
  const lastInteractionTypeRef = React.useRef('');
  const beforeGuardRef = React.useRef(null);
  const afterGuardRef = React.useRef(null);
  const mergedBeforeGuardRef = (0, _useMergedRefs.useMergedRefs)(beforeGuardRef, beforeContentFocusGuardRef, portalContext?.beforeInsideRef);
  const mergedAfterGuardRef = (0, _useMergedRefs.useMergedRefs)(afterGuardRef, portalContext?.afterInsideRef);
  const blurTimeout = (0, _useTimeout.useTimeout)();
  const pointerDownTimeout = (0, _useTimeout.useTimeout)();
  const restoreFocusFrame = (0, _useAnimationFrame.useAnimationFrame)();
  const isInsidePortal = portalContext != null;
  const floatingFocusElement = (0, _utils.getFloatingFocusElement)(floating);
  const getTabbableContent = (0, _useStableCallback.useStableCallback)((container = floatingFocusElement) => {
    return container ? (0, _tabbable.tabbable)(container, (0, _utils.getTabbableOptions)()) : [];
  });
  const getResolvedInsideElements = (0, _useStableCallback.useStableCallback)(() => getInsideElements?.().filter(element => element != null) ?? []);
  const getTabbableElements = (0, _useStableCallback.useStableCallback)(container => {
    const content = getTabbableContent(container);
    return orderRef.current.map(() => content).filter(Boolean).flat();
  });

  // Prevent Tab from escaping the modal when there are no tabbable elements.
  React.useEffect(() => {
    if (disabled || !modal) {
      return undefined;
    }
    function onKeyDown(event) {
      if (event.key === 'Tab') {
        // The focus guards have nothing to focus, so we need to stop the event.
        if ((0, _utils.contains)(floatingFocusElement, (0, _utils.activeElement)((0, _owner.ownerDocument)(floatingFocusElement))) && getTabbableContent().length === 0 && !isUntrappedTypeableCombobox) {
          (0, _utils.stopEvent)(event);
        }
      }
    }
    const doc = (0, _owner.ownerDocument)(floatingFocusElement);
    doc.addEventListener('keydown', onKeyDown);
    return () => {
      doc.removeEventListener('keydown', onKeyDown);
    };
  }, [disabled, domReference, floatingFocusElement, modal, orderRef, isUntrappedTypeableCombobox, getTabbableContent, getTabbableElements]);

  // Track pointer/keyboard interactions to disambiguate focus and outside presses.
  React.useEffect(() => {
    if (disabled || !open) {
      return undefined;
    }
    const doc = (0, _owner.ownerDocument)(floatingFocusElement);
    function clearPointerDownOutside() {
      pointerDownOutsideRef.current = false;
    }
    function onPointerDown(event) {
      const target = (0, _utils.getTarget)(event);
      const insideElements = getResolvedInsideElements();
      const pointerTargetInside = (0, _utils.contains)(floating, target) || (0, _utils.contains)(domReference, target) || (0, _utils.contains)(portalContext?.portalNode, target) || insideElements.some(element => element === target || (0, _utils.contains)(element, target));
      pointerDownOutsideRef.current = !pointerTargetInside;
      lastInteractionTypeRef.current = event.pointerType || 'keyboard';
      if (target?.closest(`[${_constants.CLICK_TRIGGER_IDENTIFIER}]`)) {
        isPointerDownRef.current = true;
      }
    }
    function onKeyDown() {
      lastInteractionTypeRef.current = 'keyboard';
    }
    doc.addEventListener('pointerdown', onPointerDown, true);
    doc.addEventListener('pointerup', clearPointerDownOutside, true);
    doc.addEventListener('pointercancel', clearPointerDownOutside, true);
    doc.addEventListener('keydown', onKeyDown, true);
    return () => {
      doc.removeEventListener('pointerdown', onPointerDown, true);
      doc.removeEventListener('pointerup', clearPointerDownOutside, true);
      doc.removeEventListener('pointercancel', clearPointerDownOutside, true);
      doc.removeEventListener('keydown', onKeyDown, true);
    };
  }, [disabled, floating, domReference, floatingFocusElement, open, portalContext, getResolvedInsideElements]);

  // Close on focus out and restore focus within the floating tree when needed.
  React.useEffect(() => {
    if (disabled || !closeOnFocusOut) {
      return undefined;
    }
    const doc = (0, _owner.ownerDocument)(floatingFocusElement);

    // In Safari, buttons lose focus when pressing them.
    function handlePointerDown() {
      isPointerDownRef.current = true;
      pointerDownTimeout.start(0, () => {
        isPointerDownRef.current = false;
      });
    }
    function handleFocusIn(event) {
      const target = (0, _utils.getTarget)(event);
      const tabbableContent = getTabbableContent();
      const tabbableIndex = tabbableContent.indexOf(target);
      if (tabbableIndex !== -1) {
        tabbableIndexRef.current = tabbableIndex;
      }
    }
    function handleFocusOutside(event) {
      const relatedTarget = event.relatedTarget;
      const currentTarget = event.currentTarget;
      const target = (0, _utils.getTarget)(event);
      queueMicrotask(() => {
        const nodeId = getNodeId();
        const triggers = store.context.triggerElements;
        const insideElements = getResolvedInsideElements();
        const isRelatedFocusGuard = relatedTarget?.hasAttribute((0, _createAttribute.createAttribute)('focus-guard')) && [beforeGuardRef.current, afterGuardRef.current, portalContext?.beforeInsideRef.current, portalContext?.afterInsideRef.current, portalContext?.beforeOutsideRef.current, portalContext?.afterOutsideRef.current, (0, _resolveRef.resolveRef)(previousFocusableElement), (0, _resolveRef.resolveRef)(nextFocusableElement)].includes(relatedTarget);
        const movedToUnrelatedNode = !((0, _utils.contains)(domReference, relatedTarget) || (0, _utils.contains)(floating, relatedTarget) || (0, _utils.contains)(relatedTarget, floating) || (0, _utils.contains)(portalContext?.portalNode, relatedTarget) || insideElements.some(element => element === relatedTarget || (0, _utils.contains)(element, relatedTarget)) || relatedTarget != null && triggers.hasElement(relatedTarget) || triggers.hasMatchingElement(trigger => (0, _utils.contains)(trigger, relatedTarget)) || isRelatedFocusGuard || tree && ((0, _utils.getNodeChildren)(tree.nodesRef.current, nodeId).find(node => (0, _utils.contains)(node.context?.elements.floating, relatedTarget) || (0, _utils.contains)(node.context?.elements.domReference, relatedTarget)) || (0, _utils.getNodeAncestors)(tree.nodesRef.current, nodeId).find(node => [node.context?.elements.floating, (0, _utils.getFloatingFocusElement)(node.context?.elements.floating)].includes(relatedTarget) || node.context?.elements.domReference === relatedTarget)));
        if (currentTarget === domReference && floatingFocusElement) {
          handleTabIndex(floatingFocusElement, orderRef);
        }

        // Restore focus to the previous tabbable element index to prevent
        // focus from being lost outside the floating tree.
        if (restoreFocus && currentTarget !== domReference && !isFocusable(target) && (0, _utils.activeElement)(doc) === doc.body) {
          // Let `FloatingPortal` effect knows that focus is still inside the
          // floating tree.
          if ((0, _dom.isHTMLElement)(floatingFocusElement)) {
            floatingFocusElement.focus();
            // If explicitly requested to restore focus to the popup container, do not search
            // for the next/previous tabbable element.
            if (restoreFocus === 'popup') {
              // If the element is removed on pointerdown, focus tries to move it,
              // but since it's removed at the same time, focus gets lost as it
              // happens after the .focus() call above.
              // In this case, focus needs to be moved asynchronously.
              restoreFocusFrame.request(() => {
                floatingFocusElement.focus();
              });
              return;
            }
          }
          const prevTabbableIndex = tabbableIndexRef.current;
          const tabbableContent = getTabbableContent();
          const nodeToFocus = tabbableContent[prevTabbableIndex] || tabbableContent[tabbableContent.length - 1] || floatingFocusElement;
          if ((0, _dom.isHTMLElement)(nodeToFocus)) {
            nodeToFocus.focus();
          }
        }

        // https://github.com/floating-ui/floating-ui/issues/3060
        if (dataRef.current.insideReactTree) {
          dataRef.current.insideReactTree = false;
          return;
        }

        // Focus did not move inside the floating tree, and there are no tabbable
        // portal guards to handle closing.
        if ((isUntrappedTypeableCombobox ? true : !modal) && relatedTarget && movedToUnrelatedNode && !isPointerDownRef.current && (
        // Fix React 18 Strict Mode returnFocus due to double rendering.
        // For an "untrapped" typeable combobox (input role=combobox with
        // initialFocus=false), re-opening the popup and tabbing out should still close it even
        // when the previously focused element (e.g. the next tabbable outside the popup) is
        // focused again. Otherwise, the popup remains open on the second Tab sequence:
        // click input -> Tab (closes) -> click input -> Tab.
        // Allow closing when `isUntrappedTypeableCombobox` regardless of the previously focused element.
        isUntrappedTypeableCombobox || relatedTarget !== getPreviouslyFocusedElement())) {
          preventReturnFocusRef.current = true;
          store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.focusOut, event));
        }
      });
    }
    function markInsideReactTree() {
      if (pointerDownOutsideRef.current) {
        return;
      }
      dataRef.current.insideReactTree = true;
      blurTimeout.start(0, () => {
        dataRef.current.insideReactTree = false;
      });
    }
    const domReferenceElement = (0, _dom.isHTMLElement)(domReference) ? domReference : null;
    const cleanups = [];
    if (!floating && !domReferenceElement) {
      return undefined;
    }
    if (domReferenceElement) {
      domReferenceElement.addEventListener('focusout', handleFocusOutside);
      domReferenceElement.addEventListener('pointerdown', handlePointerDown);
      cleanups.push(() => {
        domReferenceElement.removeEventListener('focusout', handleFocusOutside);
        domReferenceElement.removeEventListener('pointerdown', handlePointerDown);
      });
    }
    if (floating) {
      floating.addEventListener('focusin', handleFocusIn);
      floating.addEventListener('focusout', handleFocusOutside);
      if (portalContext) {
        floating.addEventListener('focusout', markInsideReactTree, true);
        cleanups.push(() => {
          floating.removeEventListener('focusout', markInsideReactTree, true);
        });
      }
      cleanups.push(() => {
        floating.removeEventListener('focusin', handleFocusIn);
        floating.removeEventListener('focusout', handleFocusOutside);
      });
    }
    return () => {
      cleanups.forEach(cleanup => {
        cleanup();
      });
    };
  }, [disabled, domReference, floating, floatingFocusElement, modal, tree, portalContext, store, closeOnFocusOut, restoreFocus, getTabbableContent, isUntrappedTypeableCombobox, getNodeId, orderRef, dataRef, blurTimeout, pointerDownTimeout, restoreFocusFrame, nextFocusableElement, previousFocusableElement, getResolvedInsideElements]);

  // Hide everything outside the floating tree from assistive tech while open.
  React.useEffect(() => {
    if (disabled || !floating || !open) {
      return undefined;
    }

    // Don't hide portals nested within the parent portal.
    const portalNodes = Array.from(portalContext?.portalNode?.querySelectorAll(`[${(0, _createAttribute.createAttribute)('portal')}]`) || []);
    const ancestors = tree ? (0, _utils.getNodeAncestors)(tree.nodesRef.current, getNodeId()) : [];
    const rootAncestorComboboxDomReference = ancestors.find(node => (0, _utils.isTypeableCombobox)(node.context?.elements.domReference || null))?.context?.elements.domReference;
    const controlInsideElements = [floating, ...portalNodes, beforeGuardRef.current, afterGuardRef.current, portalContext?.beforeOutsideRef.current, portalContext?.afterOutsideRef.current, ...getResolvedInsideElements()];
    const insideElements = [...controlInsideElements, rootAncestorComboboxDomReference, (0, _resolveRef.resolveRef)(previousFocusableElement), (0, _resolveRef.resolveRef)(nextFocusableElement), isUntrappedTypeableCombobox ? domReference : null].filter(x => x != null);
    const ariaHiddenCleanup = (0, _markOthers.markOthers)(insideElements, {
      ariaHidden: modal || isUntrappedTypeableCombobox,
      mark: false
    });
    const markerInsideElements = [floating, ...portalNodes].filter(x => x != null);
    const markerCleanup = (0, _markOthers.markOthers)(markerInsideElements);
    return () => {
      markerCleanup();
      ariaHiddenCleanup();
    };
  }, [open, disabled, domReference, floating, modal, orderRef, portalContext, isUntrappedTypeableCombobox, tree, getNodeId, nextFocusableElement, previousFocusableElement, getResolvedInsideElements]);

  // Focus the initial element when the floating element opens.
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!open || disabled || !(0, _dom.isHTMLElement)(floatingFocusElement)) {
      return;
    }
    const doc = (0, _owner.ownerDocument)(floatingFocusElement);
    const previouslyFocusedElement = (0, _utils.activeElement)(doc);

    // Wait for any layout effect state setters to execute to set `tabIndex`.
    queueMicrotask(() => {
      const focusableElements = getTabbableElements(floatingFocusElement);
      const initialFocusValueOrFn = initialFocusRef.current;
      const resolvedInitialFocus = typeof initialFocusValueOrFn === 'function' ? initialFocusValueOrFn(openInteractionTypeRef.current || '') : initialFocusValueOrFn;

      // `null` should fallback to default behavior in case of an empty ref.
      if (resolvedInitialFocus === undefined || resolvedInitialFocus === false) {
        return;
      }
      let elToFocus;
      if (resolvedInitialFocus === true || resolvedInitialFocus === null) {
        elToFocus = focusableElements[0] || floatingFocusElement;
      } else {
        elToFocus = (0, _resolveRef.resolveRef)(resolvedInitialFocus);
      }
      elToFocus = elToFocus || focusableElements[0] || floatingFocusElement;
      const focusAlreadyInsideFloatingEl = (0, _utils.contains)(floatingFocusElement, previouslyFocusedElement);
      if (focusAlreadyInsideFloatingEl) {
        return;
      }
      (0, _enqueueFocus.enqueueFocus)(elToFocus, {
        preventScroll: elToFocus === floatingFocusElement
      });
    });
  }, [disabled, open, floatingFocusElement, ignoreInitialFocus, getTabbableElements, initialFocusRef, openInteractionTypeRef]);

  // Track return focus targets and restore focus on unmount/close.
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (disabled || !floatingFocusElement) {
      return undefined;
    }
    const doc = (0, _owner.ownerDocument)(floatingFocusElement);
    const previouslyFocusedElement = (0, _utils.activeElement)(doc);
    addPreviouslyFocusedElement(previouslyFocusedElement);

    // Dismissing via outside press should always ignore `returnFocus` to
    // prevent unwanted scrolling.
    function onOpenChangeLocal(details) {
      if (!details.open) {
        closeTypeRef.current = getEventType(details.nativeEvent, lastInteractionTypeRef.current);
      }
      if (details.reason === _reasons.REASONS.triggerHover && details.nativeEvent.type === 'mouseleave') {
        preventReturnFocusRef.current = true;
      }
      if (details.reason !== _reasons.REASONS.outsidePress) {
        return;
      }
      if (details.nested) {
        preventReturnFocusRef.current = false;
      } else if ((0, _utils.isVirtualClick)(details.nativeEvent) || (0, _utils.isVirtualPointerEvent)(details.nativeEvent)) {
        preventReturnFocusRef.current = false;
      } else {
        let isPreventScrollSupported = false;
        document.createElement('div').focus({
          get preventScroll() {
            isPreventScrollSupported = true;
            return false;
          }
        });
        if (isPreventScrollSupported) {
          preventReturnFocusRef.current = false;
        } else {
          preventReturnFocusRef.current = true;
        }
      }
    }
    events.on('openchange', onOpenChangeLocal);
    function getReturnElement() {
      const returnFocusValueOrFn = returnFocusRef.current;
      let resolvedReturnFocusValue = typeof returnFocusValueOrFn === 'function' ? returnFocusValueOrFn(closeTypeRef.current) : returnFocusValueOrFn;

      // `null` should fallback to default behavior in case of an empty ref.
      if (resolvedReturnFocusValue === undefined || resolvedReturnFocusValue === false) {
        return null;
      }
      if (resolvedReturnFocusValue === null) {
        resolvedReturnFocusValue = true;
      }
      if (typeof resolvedReturnFocusValue === 'boolean') {
        const el = domReference || getPreviouslyFocusedElement();
        return el && el.isConnected ? el : null;
      }
      const fallback = domReference || getPreviouslyFocusedElement();
      return (0, _resolveRef.resolveRef)(resolvedReturnFocusValue) || fallback || null;
    }
    return () => {
      events.off('openchange', onOpenChangeLocal);
      const activeEl = (0, _utils.activeElement)(doc);
      const insideElements = getResolvedInsideElements();
      const isFocusInsideFloatingTree = (0, _utils.contains)(floating, activeEl) || insideElements.some(element => element === activeEl || (0, _utils.contains)(element, activeEl)) || tree && (0, _utils.getNodeChildren)(tree.nodesRef.current, getNodeId(), false).some(node => (0, _utils.contains)(node.context?.elements.floating, activeEl));
      const returnElement = getReturnElement();
      queueMicrotask(() => {
        // This is `returnElement`, if it's tabbable, or its first tabbable child.
        const tabbableReturnElement = getFirstTabbableElement(returnElement);
        const hasExplicitReturnFocus = typeof returnFocusRef.current !== 'boolean';
        if (
        // eslint-disable-next-line react-hooks/exhaustive-deps
        returnFocusRef.current && !preventReturnFocusRef.current && (0, _dom.isHTMLElement)(tabbableReturnElement) && (
        // If the focus moved somewhere else after mount, avoid returning focus
        // since it likely entered a different element which should be
        // respected: https://github.com/floating-ui/floating-ui/issues/2607
        !hasExplicitReturnFocus && tabbableReturnElement !== activeEl && activeEl !== doc.body ? isFocusInsideFloatingTree : true)) {
          tabbableReturnElement.focus({
            preventScroll: true
          });
        }
        preventReturnFocusRef.current = false;
      });
    };
  }, [disabled, floating, floatingFocusElement, returnFocusRef, dataRef, events, tree, domReference, getNodeId, getResolvedInsideElements]);

  // Safari may randomly scroll to the bottom of the page if an input inside a popup has focus
  // when the popup unmounts from the DOM.
  // By blurring it before the popup unmounts, we can prevent this behavior.
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!_detectBrowser.isWebKit || open || !floating) {
      return;
    }
    const activeEl = (0, _utils.activeElement)((0, _owner.ownerDocument)(floating));
    if (!(0, _dom.isHTMLElement)(activeEl) || !(0, _utils.isTypeableElement)(activeEl)) {
      return;
    }
    if ((0, _utils.contains)(floating, activeEl)) {
      activeEl.blur();
    }
  }, [open, floating]);
  // Synchronize the `context` & `modal` value to the FloatingPortal context.
  // It will decide whether or not it needs to render its own guards.
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (disabled || !portalContext) {
      return undefined;
    }
    portalContext.setFocusManagerState({
      modal,
      closeOnFocusOut,
      open,
      onOpenChange: store.setOpen,
      domReference
    });
    return () => {
      portalContext.setFocusManagerState(null);
    };
  }, [disabled, portalContext, modal, open, store, closeOnFocusOut, domReference]);

  // Keep the floating element tabIndex in sync and clear stale focus records.
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (disabled || !floatingFocusElement) {
      return undefined;
    }
    handleTabIndex(floatingFocusElement, orderRef);
    return () => {
      queueMicrotask(clearDisconnectedPreviouslyFocusedElements);
    };
  }, [disabled, floatingFocusElement, orderRef]);
  const shouldRenderGuards = !disabled && (modal ? !isUntrappedTypeableCombobox : true) && (isInsidePortal || modal);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [shouldRenderGuards && /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
      "data-type": "inside",
      ref: mergedBeforeGuardRef,
      onFocus: event => {
        if (modal) {
          const els = getTabbableElements();
          (0, _enqueueFocus.enqueueFocus)(els[els.length - 1]);
        } else if (portalContext?.portalNode) {
          preventReturnFocusRef.current = false;
          if ((0, _utils.isOutsideEvent)(event, portalContext.portalNode)) {
            const nextTabbable = (0, _utils.getNextTabbable)(domReference);
            nextTabbable?.focus();
          } else {
            (0, _resolveRef.resolveRef)(previousFocusableElement ?? portalContext.beforeOutsideRef)?.focus();
          }
        }
      }
    }), children, shouldRenderGuards && /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
      "data-type": "inside",
      ref: mergedAfterGuardRef,
      onFocus: event => {
        if (modal) {
          (0, _enqueueFocus.enqueueFocus)(getTabbableElements()[0]);
        } else if (portalContext?.portalNode) {
          if (closeOnFocusOut) {
            preventReturnFocusRef.current = true;
          }
          if ((0, _utils.isOutsideEvent)(event, portalContext.portalNode)) {
            const prevTabbable = (0, _utils.getPreviousTabbable)(domReference);
            prevTabbable?.focus();
          } else {
            (0, _resolveRef.resolveRef)(nextFocusableElement ?? portalContext.afterOutsideRef)?.focus();
          }
        }
      }
    })]
  });
}