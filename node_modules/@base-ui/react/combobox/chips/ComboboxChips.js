"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxChips = void 0;
var React = _interopRequireWildcard(require("react"));
var _store = require("@base-ui/utils/store");
var _useRenderElement = require("../../utils/useRenderElement");
var _ComboboxChipsContext = require("./ComboboxChipsContext");
var _CompositeList = require("../../composite/list/CompositeList");
var _ComboboxRootContext = require("../root/ComboboxRootContext");
var _store2 = require("../store");
var _constants = require("../../utils/constants");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * A container for the chips in a multiselectable input.
 * Renders a `<div>` element.
 */
const ComboboxChips = exports.ComboboxChips = /*#__PURE__*/React.forwardRef(function ComboboxChips(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const store = (0, _ComboboxRootContext.useComboboxRootContext)();
  const open = (0, _store.useStore)(store, _store2.selectors.open);
  const hasSelectionChips = (0, _store.useStore)(store, _store2.selectors.hasSelectionChips);
  const [highlightedChipIndex, setHighlightedChipIndex] = React.useState(undefined);
  if (open && highlightedChipIndex !== undefined) {
    setHighlightedChipIndex(undefined);
  }
  const chipsRef = React.useRef([]);
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [forwardedRef, store.state.chipsContainerRef],
    // NVDA enters browse mode instead of staying in focus mode when navigating with
    // arrow keys inside a container unless it has a toolbar role.
    props: [hasSelectionChips ? {
      role: 'toolbar'
    } : _constants.EMPTY_OBJECT, elementProps]
  });
  const contextValue = React.useMemo(() => ({
    highlightedChipIndex,
    setHighlightedChipIndex,
    chipsRef
  }), [highlightedChipIndex, setHighlightedChipIndex, chipsRef]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_ComboboxChipsContext.ComboboxChipsContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeList.CompositeList, {
      elementsRef: chipsRef,
      children: element
    })
  });
});
if (process.env.NODE_ENV !== "production") ComboboxChips.displayName = "ComboboxChips";