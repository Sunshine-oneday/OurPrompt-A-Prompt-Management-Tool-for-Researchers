"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FocusGuard = void 0;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _detectBrowser = require("@base-ui/utils/detectBrowser");
var _visuallyHidden = require("@base-ui/utils/visuallyHidden");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * @internal
 */
const FocusGuard = exports.FocusGuard = /*#__PURE__*/React.forwardRef(function FocusGuard(props, ref) {
  const [role, setRole] = React.useState();
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (_detectBrowser.isSafari) {
      // Unlike other screen readers such as NVDA and JAWS, the virtual cursor
      // on VoiceOver does trigger the onFocus event, so we can use the focus
      // trap element. On Safari, only buttons trigger the onFocus event.
      setRole('button');
    }
  }, []);
  const restProps = {
    tabIndex: 0,
    // Role is only for VoiceOver
    role
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
    ...props,
    ref: ref,
    style: _visuallyHidden.visuallyHidden,
    "aria-hidden": role ? undefined : true,
    ...restProps,
    "data-base-ui-focus-guard": ""
  });
});
if (process.env.NODE_ENV !== "production") FocusGuard.displayName = "FocusGuard";