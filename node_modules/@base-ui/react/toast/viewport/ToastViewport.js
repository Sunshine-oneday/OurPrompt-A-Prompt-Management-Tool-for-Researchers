"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToastViewport = void 0;
var React = _interopRequireWildcard(require("react"));
var _owner = require("@base-ui/utils/owner");
var _visuallyHidden = require("@base-ui/utils/visuallyHidden");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _utils = require("../../floating-ui-react/utils");
var _FocusGuard = require("../../utils/FocusGuard");
var _ToastProviderContext = require("../provider/ToastProviderContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _focusVisible = require("../utils/focusVisible");
var _ToastViewportCssVars = require("./ToastViewportCssVars");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * A container viewport for toasts.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Toast](https://base-ui.com/react/components/toast)
 */
const ToastViewport = exports.ToastViewport = /*#__PURE__*/React.forwardRef(function ToastViewport(componentProps, forwardedRef) {
  const {
    render,
    className,
    children,
    ...elementProps
  } = componentProps;
  const store = (0, _ToastProviderContext.useToastProviderContext)();
  const windowFocusTimeout = (0, _useTimeout.useTimeout)();
  const handlingFocusGuardRef = React.useRef(false);
  const markedReadyForMouseLeaveRef = React.useRef(false);
  const isEmpty = store.useState('isEmpty');
  const toasts = store.useState('toasts');
  const focused = store.useState('focused');
  const expanded = store.useState('expanded');
  const prevFocusElement = store.useState('prevFocusElement');
  const frontmostHeight = toasts[0]?.height ?? 0;
  const hasTransitioningToasts = React.useMemo(() => toasts.some(toast => toast.transitionStatus === 'ending'), [toasts]);

  // Listen globally for F6 so we can force-focus the viewport.
  React.useEffect(() => {
    const viewport = store.state.viewport;
    if (!viewport) {
      return undefined;
    }
    function handleGlobalKeyDown(event) {
      if (isEmpty) {
        return;
      }
      if (event.key === 'F6' && event.target !== viewport) {
        event.preventDefault();
        store.setPrevFocusElement((0, _utils.activeElement)((0, _owner.ownerDocument)(viewport)));
        viewport?.focus({
          preventScroll: true
        });
        store.pauseTimers();
        store.setFocused(true);
      }
    }
    const win = (0, _owner.ownerWindow)(viewport);
    win.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      win.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [store, isEmpty]);
  React.useEffect(() => {
    const viewport = store.state.viewport;
    if (!viewport || isEmpty) {
      return undefined;
    }
    const win = (0, _owner.ownerWindow)(viewport);
    function handleWindowBlur(event) {
      if (event.target !== win) {
        return;
      }
      store.setIsWindowFocused(false);
      store.pauseTimers();
    }
    function handleWindowFocus(event) {
      if (event.relatedTarget || event.target === win) {
        return;
      }
      const target = (0, _utils.getTarget)(event);
      const activeEl = (0, _utils.activeElement)((0, _owner.ownerDocument)(viewport));
      if (!(0, _utils.contains)(viewport, target) || !(0, _focusVisible.isFocusVisible)(activeEl)) {
        store.resumeTimers();
      }

      // Wait for the `handleFocus` event to fire.
      windowFocusTimeout.start(0, () => store.setIsWindowFocused(true));
    }
    win.addEventListener('blur', handleWindowBlur, true);
    win.addEventListener('focus', handleWindowFocus, true);
    return () => {
      win.removeEventListener('blur', handleWindowBlur, true);
      win.removeEventListener('focus', handleWindowFocus, true);
    };
  }, [store, windowFocusTimeout,
  // `store.state.viewport` isn't available on the first render,
  // since the portal node hasn't yet been created.
  // By adding this dependency, we ensure the window listeners
  // are added when toasts have been created, once the ref is available.
  isEmpty]);
  React.useEffect(() => {
    const viewport = store.state.viewport;
    if (!viewport || isEmpty) {
      return undefined;
    }
    const doc = (0, _owner.ownerDocument)(viewport);
    doc.addEventListener('pointerdown', store.handleDocumentPointerDown, true);
    return () => {
      doc.removeEventListener('pointerdown', store.handleDocumentPointerDown, true);
    };
  }, [isEmpty, store]);
  function handleFocusGuard(event) {
    const viewport = store.state.viewport;
    if (!viewport) {
      return;
    }
    handlingFocusGuardRef.current = true;

    // If we're coming off the container, move to the first toast
    if (event.relatedTarget === viewport) {
      toasts[0]?.ref?.current?.focus();
    } else {
      store.restoreFocusToPrevElement();
    }
  }
  function handleKeyDown(event) {
    if (event.key === 'Tab' && event.shiftKey && event.target === store.state.viewport) {
      event.preventDefault();
      store.restoreFocusToPrevElement();
      store.resumeTimers();
    }
  }
  React.useEffect(() => {
    if (!store.state.isWindowFocused || hasTransitioningToasts || !markedReadyForMouseLeaveRef.current) {
      return;
    }

    // Once transitions have finished, see if a mouseleave was already triggered
    // but blocked from taking effect. If so, we can now safely resume timers and
    // collapse the viewport.
    store.resumeTimers();
    store.setHovering(false);
    markedReadyForMouseLeaveRef.current = false;
  }, [hasTransitioningToasts, store]);
  function handleMouseEnter() {
    store.pauseTimers();
    store.setHovering(true);
    markedReadyForMouseLeaveRef.current = false;
  }
  function handleMouseLeave() {
    if (hasTransitioningToasts) {
      // When swiping to dismiss, wait until the transitions have settled
      // to avoid the viewport collapsing while the user is interacting.
      markedReadyForMouseLeaveRef.current = true;
    } else {
      store.resumeTimers();
      store.setHovering(false);
    }
  }
  function handleFocus() {
    if (handlingFocusGuardRef.current) {
      handlingFocusGuardRef.current = false;
      return;
    }
    if (focused) {
      return;
    }

    // Only set focused when the active element is focus-visible.
    // This prevents the viewport from staying expanded when clicking inside without
    // keyboard navigation.
    if ((0, _focusVisible.isFocusVisible)((0, _owner.ownerDocument)(store.state.viewport).activeElement)) {
      store.setFocused(true);
      store.pauseTimers();
    }
  }
  function handleBlur(event) {
    if (!focused || (0, _utils.contains)(store.state.viewport, event.relatedTarget)) {
      return;
    }
    store.setFocused(false);
    store.resumeTimers();
  }
  const defaultProps = {
    tabIndex: -1,
    role: 'region',
    'aria-live': 'polite',
    'aria-atomic': false,
    'aria-relevant': 'additions text',
    'aria-label': 'Notifications',
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onClick: handleFocus
  };
  const state = {
    expanded
  };
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [forwardedRef, store.setViewport],
    state,
    props: [defaultProps, {
      style: {
        [_ToastViewportCssVars.ToastViewportCssVars.frontmostHeight]: frontmostHeight ? `${frontmostHeight}px` : undefined
      }
    }, elementProps, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
        children: [!isEmpty && prevFocusElement && /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
          onFocus: handleFocusGuard
        }), children, !isEmpty && prevFocusElement && /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
          onFocus: handleFocusGuard
        })]
      })
    }]
  });
  const highPriorityToasts = React.useMemo(() => toasts.filter(toast => toast.priority === 'high'), [toasts]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
    children: [!isEmpty && prevFocusElement && /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
      onFocus: handleFocusGuard
    }), element, !focused && highPriorityToasts.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      style: _visuallyHidden.visuallyHidden,
      children: highPriorityToasts.map(toast => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        role: "alert",
        "aria-atomic": true,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          children: toast.title
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          children: toast.description
        })]
      }, toast.id))
    })]
  });
});
if (process.env.NODE_ENV !== "production") ToastViewport.displayName = "ToastViewport";