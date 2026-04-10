"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxInputGroup = void 0;
var React = _interopRequireWildcard(require("react"));
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _store = require("@base-ui/utils/store");
var _useRenderElement = require("../../utils/useRenderElement");
var _FieldRootContext = require("../../field/root/FieldRootContext");
var _ComboboxRootContext = require("../root/ComboboxRootContext");
var _store2 = require("../store");
var _stateAttributesMapping = require("../utils/stateAttributesMapping");
/**
 * A wrapper for the input and its associated controls.
 * Renders a `<div>` element.
 */
const ComboboxInputGroup = exports.ComboboxInputGroup = /*#__PURE__*/React.forwardRef(function ComboboxInputGroup(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const {
    state: fieldState,
    disabled: fieldDisabled
  } = (0, _FieldRootContext.useFieldRootContext)();
  const store = (0, _ComboboxRootContext.useComboboxRootContext)();
  const {
    filteredItems
  } = (0, _ComboboxRootContext.useComboboxDerivedItemsContext)();
  const open = (0, _store.useStore)(store, _store2.selectors.open);
  const mounted = (0, _store.useStore)(store, _store2.selectors.mounted);
  const popupSideValue = (0, _store.useStore)(store, _store2.selectors.popupSide);
  const positionerElement = (0, _store.useStore)(store, _store2.selectors.positionerElement);
  const comboboxDisabled = (0, _store.useStore)(store, _store2.selectors.disabled);
  const readOnly = (0, _store.useStore)(store, _store2.selectors.readOnly);
  const hasSelectedValue = (0, _store.useStore)(store, _store2.selectors.hasSelectedValue);
  const selectionMode = (0, _store.useStore)(store, _store2.selectors.selectionMode);
  const popupSide = mounted && positionerElement ? popupSideValue : null;
  const disabled = fieldDisabled || comboboxDisabled;
  const listEmpty = filteredItems.length === 0;
  const placeholder = selectionMode === 'none' ? false : !hasSelectedValue;
  const state = {
    ...fieldState,
    open,
    disabled,
    readOnly,
    popupSide,
    listEmpty,
    placeholder
  };
  const setInputGroupElement = (0, _useStableCallback.useStableCallback)(element => {
    store.set('inputGroupElement', element);
  });
  return (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [forwardedRef, setInputGroupElement],
    props: [{
      role: 'group'
    }, elementProps],
    state,
    stateAttributesMapping: _stateAttributesMapping.triggerStateAttributesMapping
  });
});
if (process.env.NODE_ENV !== "production") ComboboxInputGroup.displayName = "ComboboxInputGroup";