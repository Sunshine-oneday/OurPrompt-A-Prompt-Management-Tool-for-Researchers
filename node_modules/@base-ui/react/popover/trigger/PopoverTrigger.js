"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PopoverTrigger = void 0;
var _formatErrorMessage2 = _interopRequireDefault(require("@base-ui/utils/formatErrorMessage"));
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _PopoverRootContext = require("../root/PopoverRootContext");
var _useButton = require("../../use-button/useButton");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _useRenderElement = require("../../utils/useRenderElement");
var _constants = require("../../utils/constants");
var _floatingUiReact = require("../../floating-ui-react");
var _constants2 = require("../utils/constants");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _FocusGuard = require("../../utils/FocusGuard");
var _utils = require("../../floating-ui-react/utils");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _popups = require("../../utils/popups");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * A button that opens the popover.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
const PopoverTrigger = exports.PopoverTrigger = /*#__PURE__*/React.forwardRef(function PopoverTrigger(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled = false,
    nativeButton = true,
    handle,
    payload,
    openOnHover = false,
    delay = _constants2.OPEN_DELAY,
    closeDelay = 0,
    id: idProp,
    ...elementProps
  } = componentProps;
  const rootContext = (0, _PopoverRootContext.usePopoverRootContext)(true);
  const store = handle?.store ?? rootContext?.store;
  if (!store) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <Popover.Trigger> must be either used within a <Popover.Root> component or provided with a handle.' : (0, _formatErrorMessage2.default)(74));
  }
  const thisTriggerId = (0, _useBaseUiId.useBaseUiId)(idProp);
  const isTriggerActive = store.useState('isTriggerActive', thisTriggerId);
  const floatingContext = store.useState('floatingRootContext');
  const isOpenedByThisTrigger = store.useState('isOpenedByTrigger', thisTriggerId);
  const triggerElementRef = React.useRef(null);
  const {
    registerTrigger,
    isMountedByThisTrigger
  } = (0, _popups.useTriggerDataForwarding)(thisTriggerId, triggerElementRef, store, {
    payload,
    disabled,
    openOnHover,
    closeDelay
  });
  const openReason = store.useState('openChangeReason');
  const stickIfOpen = store.useState('stickIfOpen');
  const openMethod = store.useState('openMethod');
  const hoverProps = (0, _floatingUiReact.useHoverReferenceInteraction)(floatingContext, {
    enabled: floatingContext != null && openOnHover && (openMethod !== 'touch' || openReason !== _reasons.REASONS.triggerPress),
    mouseOnly: true,
    move: false,
    handleClose: (0, _floatingUiReact.safePolygon)(),
    restMs: delay,
    delay: {
      close: closeDelay
    },
    triggerElementRef,
    isActiveTrigger: isTriggerActive
  });
  const click = (0, _floatingUiReact.useClick)(floatingContext, {
    enabled: floatingContext != null,
    stickIfOpen
  });
  const localProps = (0, _floatingUiReact.useInteractions)([click]);
  const rootTriggerProps = store.useState('triggerProps', isMountedByThisTrigger);
  const state = {
    disabled,
    open: isOpenedByThisTrigger
  };
  const {
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
    disabled,
    native: nativeButton
  });
  const stateAttributesMapping = React.useMemo(() => ({
    open(value) {
      if (value && openReason === _reasons.REASONS.triggerPress) {
        return _popupStateMapping.pressableTriggerOpenStateMapping.open(value);
      }
      return _popupStateMapping.triggerOpenStateMapping.open(value);
    }
  }), [openReason]);
  const element = (0, _useRenderElement.useRenderElement)('button', componentProps, {
    state,
    ref: [buttonRef, forwardedRef, registerTrigger, triggerElementRef],
    props: [localProps.getReferenceProps(), hoverProps, rootTriggerProps, {
      [_constants.CLICK_TRIGGER_IDENTIFIER]: '',
      id: thisTriggerId
    }, elementProps, getButtonProps],
    stateAttributesMapping
  });
  const preFocusGuardRef = React.useRef(null);
  const handlePreFocusGuardFocus = (0, _useStableCallback.useStableCallback)(event => {
    ReactDOM.flushSync(() => {
      store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.focusOut, event.nativeEvent, event.currentTarget));
    });
    const previousTabbable = (0, _utils.getTabbableBeforeElement)(preFocusGuardRef.current);
    previousTabbable?.focus();
  });
  const handleFocusTargetFocus = (0, _useStableCallback.useStableCallback)(event => {
    const positionerElement = store.select('positionerElement');
    if (positionerElement && (0, _utils.isOutsideEvent)(event, positionerElement)) {
      store.context.beforeContentFocusGuardRef.current?.focus();
    } else {
      ReactDOM.flushSync(() => {
        store.setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.focusOut, event.nativeEvent, event.currentTarget));
      });
      let nextTabbable = (0, _utils.getTabbableAfterElement)(store.context.triggerFocusTargetRef.current || triggerElementRef.current);
      while (nextTabbable !== null && (0, _utils.contains)(positionerElement, nextTabbable)) {
        const prevTabbable = nextTabbable;
        nextTabbable = (0, _utils.getNextTabbable)(nextTabbable);
        if (nextTabbable === prevTabbable) {
          break;
        }
      }
      nextTabbable?.focus();
    }
  });

  // A fragment with key is required to ensure that the `element` is mounted to the same DOM node
  // regardless of whether the focus guards are rendered or not.

  if (isTriggerActive) {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
        ref: preFocusGuardRef,
        onFocus: handlePreFocusGuardFocus
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
        children: element
      }, thisTriggerId), /*#__PURE__*/(0, _jsxRuntime.jsx)(_FocusGuard.FocusGuard, {
        ref: store.context.triggerFocusTargetRef,
        onFocus: handleFocusTargetFocus
      })]
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  }, thisTriggerId);
});
if (process.env.NODE_ENV !== "production") PopoverTrigger.displayName = "PopoverTrigger";