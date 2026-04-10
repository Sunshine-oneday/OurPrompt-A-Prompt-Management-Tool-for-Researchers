"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxChip = void 0;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _store = require("@base-ui/utils/store");
var _useRenderElement = require("../../utils/useRenderElement");
var _ComboboxChipsContext = require("../chips/ComboboxChipsContext");
var _ComboboxRootContext = require("../root/ComboboxRootContext");
var _useCompositeListItem = require("../../composite/list/useCompositeListItem");
var _ComboboxChipContext = require("./ComboboxChipContext");
var _utils = require("../../floating-ui-react/utils");
var _store2 = require("../store");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * An individual chip that represents a value in a multiselectable input.
 * Renders a `<div>` element.
 */
const ComboboxChip = exports.ComboboxChip = /*#__PURE__*/React.forwardRef(function ComboboxChip(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  const store = (0, _ComboboxRootContext.useComboboxRootContext)();
  const {
    setHighlightedChipIndex,
    chipsRef
  } = (0, _ComboboxChipsContext.useComboboxChipsContext)();
  const disabled = (0, _store.useStore)(store, _store2.selectors.disabled);
  const readOnly = (0, _store.useStore)(store, _store2.selectors.readOnly);
  const selectedValue = (0, _store.useStore)(store, _store2.selectors.selectedValue);
  const {
    ref,
    index
  } = (0, _useCompositeListItem.useCompositeListItem)();
  function handleKeyDown(event) {
    let nextIndex = index;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) {
        nextIndex = index - 1;
      } else {
        nextIndex = undefined;
      }
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (index < selectedValue.length - 1) {
        nextIndex = index + 1;
      } else {
        nextIndex = undefined;
      }
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      const computedNextIndex = index >= selectedValue.length - 1 ? selectedValue.length - 2 : index;
      nextIndex = computedNextIndex >= 0 ? computedNextIndex : undefined;
      (0, _utils.stopEvent)(event);
      store.state.setIndices({
        activeIndex: null,
        selectedIndex: null,
        type: 'keyboard'
      });
      store.state.setSelectedValue(selectedValue.filter((_, i) => i !== index), (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.none, event.nativeEvent));
    } else if (event.key === 'Enter' || event.key === ' ') {
      (0, _utils.stopEvent)(event);
      nextIndex = undefined;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      (0, _utils.stopEvent)(event);
      store.state.setOpen(true, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.listNavigation, event.nativeEvent));
      nextIndex = undefined;
    } else if (
    // Check for printable characters (letters, numbers, symbols)
    event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      nextIndex = undefined;
    }
    return nextIndex;
  }
  const state = {
    disabled
  };
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [forwardedRef, ref],
    state,
    props: [{
      tabIndex: -1,
      'aria-disabled': disabled || undefined,
      'aria-readonly': readOnly || undefined,
      onKeyDown(event) {
        if (disabled || readOnly) {
          return;
        }
        const nextIndex = handleKeyDown(event);
        ReactDOM.flushSync(() => {
          setHighlightedChipIndex(nextIndex);
        });
        if (nextIndex === undefined) {
          store.state.inputRef.current?.focus();
        } else {
          chipsRef.current[nextIndex]?.focus();
        }
      },
      onMouseDown(event) {
        if (readOnly) {
          return;
        }
        event.preventDefault();
        if (disabled) {
          return;
        }
        store.state.inputRef.current?.focus();
      }
    }, elementProps]
  });
  const contextValue = React.useMemo(() => ({
    index
  }), [index]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_ComboboxChipContext.ComboboxChipContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ComboboxChip.displayName = "ComboboxChip";