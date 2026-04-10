"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuRadioGroup = void 0;
var React = _interopRequireWildcard(require("react"));
var _useControlled = require("@base-ui/utils/useControlled");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _MenuRadioGroupContext = require("./MenuRadioGroupContext");
var _useRenderElement = require("../../utils/useRenderElement");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups related radio items.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
const MenuRadioGroup = exports.MenuRadioGroup = /*#__PURE__*/React.memo(/*#__PURE__*/React.forwardRef(function MenuRadioGroup(componentProps, forwardedRef) {
  const {
    render,
    className,
    value: valueProp,
    defaultValue,
    onValueChange: onValueChangeProp,
    disabled = false,
    ...elementProps
  } = componentProps;
  const [value, setValueUnwrapped] = (0, _useControlled.useControlled)({
    controlled: valueProp,
    default: defaultValue,
    name: 'MenuRadioGroup'
  });
  const onValueChange = (0, _useStableCallback.useStableCallback)(onValueChangeProp);
  const setValue = (0, _useStableCallback.useStableCallback)((newValue, eventDetails) => {
    onValueChange?.(newValue, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setValueUnwrapped(newValue);
  });
  const state = {
    disabled
  };
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    ref: forwardedRef,
    props: {
      role: 'group',
      'aria-disabled': disabled || undefined,
      ...elementProps
    }
  });
  const context = React.useMemo(() => ({
    value,
    setValue,
    disabled
  }), [value, setValue, disabled]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_MenuRadioGroupContext.MenuRadioGroupContext.Provider, {
    value: context,
    children: element
  });
}));
if (process.env.NODE_ENV !== "production") MenuRadioGroup.displayName = "MenuRadioGroup";