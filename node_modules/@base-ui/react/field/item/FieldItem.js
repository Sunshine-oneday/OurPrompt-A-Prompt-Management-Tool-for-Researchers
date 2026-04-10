"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldItem = void 0;
var React = _interopRequireWildcard(require("react"));
var _FieldRootContext = require("../root/FieldRootContext");
var _constants = require("../utils/constants");
var _useRenderElement = require("../../utils/useRenderElement");
var _FieldItemContext = require("./FieldItemContext");
var _labelableProvider = require("../../labelable-provider");
var _CheckboxGroupContext = require("../../checkbox-group/CheckboxGroupContext");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups individual items in a checkbox group or radio group with a label and description.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Field](https://base-ui.com/react/components/field)
 */
const FieldItem = exports.FieldItem = /*#__PURE__*/React.forwardRef(function FieldItem(componentProps, forwardedRef) {
  const {
    render,
    className,
    disabled: disabledProp = false,
    ...elementProps
  } = componentProps;
  const {
    state,
    disabled: rootDisabled
  } = (0, _FieldRootContext.useFieldRootContext)(false);
  const disabled = rootDisabled || disabledProp;
  const checkboxGroupContext = (0, _CheckboxGroupContext.useCheckboxGroupContext)();
  // checkboxGroupContext.parent is truthy even if no parent checkbox is involved
  const parentId = checkboxGroupContext?.parent.id;
  // this a more reliable check
  const hasParentCheckbox = checkboxGroupContext?.allValues !== undefined;
  const controlId = hasParentCheckbox ? parentId : undefined;
  const fieldItemContext = React.useMemo(() => ({
    disabled
  }), [disabled]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping: _constants.fieldValidityMapping
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_labelableProvider.LabelableProvider, {
    controlId: controlId,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_FieldItemContext.FieldItemContext.Provider, {
      value: fieldItemContext,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") FieldItem.displayName = "FieldItem";