"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFocus = useFocus;
var React = _interopRequireWildcard(require("react"));
var _dom = require("@floating-ui/utils/dom");
var _detectBrowser = require("@base-ui/utils/detectBrowser");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _owner = require("@base-ui/utils/owner");
var _utils = require("../utils");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _createAttribute = require("../utils/createAttribute");
const isMacSafari = _detectBrowser.isMac && _detectBrowser.isSafari;
/**
 * Opens the floating element while the reference element has focus, like CSS
 * `:focus`.
 * @see https://floating-ui.com/docs/useFocus
 */
function useFocus(context, props = {}) {
  const store = 'rootStore' in context ? context.rootStore : context;
  const {
    events,
    dataRef
  } = store.context;
  const {
    enabled = true,
    delay
  } = props;
  const blockFocusRef = React.useRef(false);
  // Track which reference should be blocked from re-opening after Escape/press dismissal.
  const blockedReferenceRef = React.useRef(null);
  const timeout = (0, _useTimeout.useTimeout)();
  const keyboardModalityRef = React.useRef(true);
  React.useEffect(() => {
    const domReference = store.select('domReferenceElement');
    if (!enabled) {
      return undefined;
    }
    const win = (0, _dom.getWindow)(domReference);

    // If the reference was focused and the user left the tab/window, and the
    // floating element was not open, the focus should be blocked when they
    // return to the tab/window.
    function onBlur() {
      const currentDomReference = store.select('domReferenceElement');
      if (!store.select('open') && (0, _dom.isHTMLElement)(currentDomReference) && currentDomReference === (0, _utils.activeElement)((0, _owner.ownerDocument)(currentDomReference))) {
        blockFocusRef.current = true;
      }
    }
    function onKeyDown() {
      keyboardModalityRef.current = true;
    }
    function onPointerDown() {
      keyboardModalityRef.current = false;
    }
    win.addEventListener('blur', onBlur);
    if (isMacSafari) {
      win.addEventListener('keydown', onKeyDown, true);
      win.addEventListener('pointerdown', onPointerDown, true);
    }
    return () => {
      win.removeEventListener('blur', onBlur);
      if (isMacSafari) {
        win.removeEventListener('keydown', onKeyDown, true);
        win.removeEventListener('pointerdown', onPointerDown, true);
      }
    };
  }, [store, enabled]);
  React.useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    function onOpenChangeLocal(details) {
      if (details.reason === _reasons.REASONS.triggerPress || details.reason === _reasons.REASONS.escapeKey) {
        const referenceElement = store.select('domReferenceElement');
        if ((0, _dom.isElement)(referenceElement)) {
          blockedReferenceRef.current = referenceElement;
          blockFocusRef.current = true;
        }
      }
    }
    events.on('openchange', onOpenChangeLocal);
    return () => {
      events.off('openchange', onOpenChangeLocal);
    };
  }, [events, enabled, store]);
  const reference = React.useMemo(() => ({
    onMouseLeave() {
      blockFocusRef.current = false;
      blockedReferenceRef.current = null;
    },
    onFocus(event) {
      const focusTarget = event.currentTarget;
      if (blockFocusRef.current) {
        if (blockedReferenceRef.current === focusTarget) {
          return;
        }
        blockFocusRef.current = false;
        blockedReferenceRef.current = null;
      }
      const target = (0, _utils.getTarget)(event.nativeEvent);
      if ((0, _dom.isElement)(target)) {
        // Safari fails to match `:focus-visible` if focus was initially
        // outside the document.
        if (isMacSafari && !event.relatedTarget) {
          if (!keyboardModalityRef.current && !(0, _utils.isTypeableElement)(target)) {
            return;
          }
        } else if (!(0, _utils.matchesFocusVisible)(target)) {
          return;
        }
      }
      const movedFromOtherEnabledTrigger = (0, _utils.isTargetInsideEnabledTrigger)(event.relatedTarget, store.context.triggerElements);
      const {
        nativeEvent,
        currentTarget
      } = event;
      const delayValue = typeof delay === 'function' ? delay() : delay;
      if (store.select('open') && movedFromOtherEnabledTrigger || delayValue === 0 || delayValue === undefined) {
        store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerFocus, nativeEvent, currentTarget));
        return;
      }
      timeout.start(delayValue, () => {
        if (blockFocusRef.current) {
          return;
        }
        store.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerFocus, nativeEvent, currentTarget));
      });
    },
    onBlur(event) {
      blockFocusRef.current = false;
      blockedReferenceRef.current = null;
      const relatedTarget = event.relatedTarget;
      const nativeEvent = event.nativeEvent;

      // Hit the non-modal focus management portal guard. Focus will be
      // moved into the floating element immediately after.
      const movedToFocusGuard = (0, _dom.isElement)(relatedTarget) && relatedTarget.hasAttribute((0, _createAttribute.createAttribute)('focus-guard')) && relatedTarget.getAttribute('data-type') === 'outside';

      // Wait for the window blur listener to fire.
      timeout.start(0, () => {
        const domReference = store.select('domReferenceElement');
        const activeEl = (0, _utils.activeElement)(domReference ? domReference.ownerDocument : document);

        // Focus left the page, keep it open.
        if (!relatedTarget && activeEl === domReference) {
          return;
        }

        // When focusing the reference element (e.g. regular click), then
        // clicking into the floating element, prevent it from hiding.
        // Note: it must be focusable, e.g. `tabindex="-1"`.
        // We can not rely on relatedTarget to point to the correct element
        // as it will only point to the shadow host of the newly focused element
        // and not the element that actually has received focus if it is located
        // inside a shadow root.
        if ((0, _utils.contains)(dataRef.current.floatingContext?.refs.floating.current, activeEl) || (0, _utils.contains)(domReference, activeEl) || movedToFocusGuard) {
          return;
        }

        // If the next focused element is one of the triggers, do not close
        // the floating element. The focus handler of that trigger will
        // handle the open state.
        const nextFocusedElement = relatedTarget ?? activeEl;
        if ((0, _utils.isTargetInsideEnabledTrigger)(nextFocusedElement, store.context.triggerElements)) {
          return;
        }
        store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.triggerFocus, nativeEvent));
      });
    }
  }), [dataRef, store, timeout, delay]);
  return React.useMemo(() => enabled ? {
    reference,
    trigger: reference
  } : {}, [enabled, reference]);
}