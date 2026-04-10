"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DialogPopup = void 0;
var React = _interopRequireWildcard(require("react"));
var _floatingUiReact = require("../../floating-ui-react");
var _DialogRootContext = require("../root/DialogRootContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _stateAttributesMapping = require("../../utils/stateAttributesMapping");
var _DialogPopupCssVars = require("./DialogPopupCssVars");
var _DialogPopupDataAttributes = require("./DialogPopupDataAttributes");
var _DialogPortalContext = require("../portal/DialogPortalContext");
var _useOpenChangeComplete = require("../../utils/useOpenChangeComplete");
var _composite = require("../../composite/composite");
var _jsxRuntime = require("react/jsx-runtime");
const stateAttributesMapping = {
  ..._popupStateMapping.popupStateMapping,
  ..._stateAttributesMapping.transitionStatusMapping,
  nestedDialogOpen(value) {
    return value ? {
      [_DialogPopupDataAttributes.DialogPopupDataAttributes.nestedDialogOpen]: ''
    } : null;
  }
};

/**
 * A container for the dialog contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Dialog](https://base-ui.com/react/components/dialog)
 */
const DialogPopup = exports.DialogPopup = /*#__PURE__*/React.forwardRef(function DialogPopup(componentProps, forwardedRef) {
  const {
    className,
    finalFocus,
    initialFocus,
    render,
    ...elementProps
  } = componentProps;
  const {
    store
  } = (0, _DialogRootContext.useDialogRootContext)();
  const descriptionElementId = store.useState('descriptionElementId');
  const disablePointerDismissal = store.useState('disablePointerDismissal');
  const floatingRootContext = store.useState('floatingRootContext');
  const rootPopupProps = store.useState('popupProps');
  const modal = store.useState('modal');
  const mounted = store.useState('mounted');
  const nested = store.useState('nested');
  const nestedOpenDialogCount = store.useState('nestedOpenDialogCount');
  const open = store.useState('open');
  const openMethod = store.useState('openMethod');
  const titleElementId = store.useState('titleElementId');
  const transitionStatus = store.useState('transitionStatus');
  const role = store.useState('role');
  (0, _DialogPortalContext.useDialogPortalContext)();
  (0, _useOpenChangeComplete.useOpenChangeComplete)({
    open,
    ref: store.context.popupRef,
    onComplete() {
      if (open) {
        store.context.onOpenChangeComplete?.(true);
      }
    }
  });

  // Default initial focus logic:
  // If opened by touch, focus the popup element to prevent the virtual keyboard from opening
  // (this is required for Android specifically as iOS handles this automatically).
  function defaultInitialFocus(interactionType) {
    if (interactionType === 'touch') {
      return store.context.popupRef.current;
    }
    return true;
  }
  const resolvedInitialFocus = initialFocus === undefined ? defaultInitialFocus : initialFocus;
  const nestedDialogOpen = nestedOpenDialogCount > 0;
  const state = {
    open,
    nested,
    transitionStatus,
    nestedDialogOpen
  };
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    props: [rootPopupProps, {
      'aria-labelledby': titleElementId ?? undefined,
      'aria-describedby': descriptionElementId ?? undefined,
      role,
      tabIndex: -1,
      hidden: !mounted,
      onKeyDown(event) {
        if (_composite.COMPOSITE_KEYS.has(event.key)) {
          event.stopPropagation();
        }
      },
      style: {
        [_DialogPopupCssVars.DialogPopupCssVars.nestedDialogs]: nestedOpenDialogCount
      }
    }, elementProps],
    ref: [forwardedRef, store.context.popupRef, store.useStateSetter('popupElement')],
    stateAttributesMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_floatingUiReact.FloatingFocusManager, {
    context: floatingRootContext,
    openInteractionType: openMethod,
    disabled: !mounted,
    closeOnFocusOut: !disablePointerDismissal,
    initialFocus: resolvedInitialFocus,
    returnFocus: finalFocus,
    modal: modal !== false,
    restoreFocus: "popup",
    children: element
  });
});
if (process.env.NODE_ENV !== "production") DialogPopup.displayName = "DialogPopup";