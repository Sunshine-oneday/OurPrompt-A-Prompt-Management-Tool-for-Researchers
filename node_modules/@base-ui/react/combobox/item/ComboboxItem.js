"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxItem = void 0;
var React = _interopRequireWildcard(require("react"));
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _store = require("@base-ui/utils/store");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _ComboboxRootContext = require("../root/ComboboxRootContext");
var _useCompositeListItem = require("../../composite/list/useCompositeListItem");
var _useRenderElement = require("../../utils/useRenderElement");
var _ComboboxItemContext = require("./ComboboxItemContext");
var _store2 = require("../store");
var _useButton = require("../../use-button");
var _ComboboxRowContext = require("../row/ComboboxRowContext");
var _itemEquality = require("../../utils/itemEquality");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * An individual item in the list.
 * Renders a `<div>` element.
 */
const ComboboxItem = exports.ComboboxItem = /*#__PURE__*/React.memo(/*#__PURE__*/React.forwardRef(function ComboboxItem(componentProps, forwardedRef) {
  const {
    render,
    className,
    value: itemValue = null,
    index: indexProp,
    disabled = false,
    nativeButton = false,
    ...elementProps
  } = componentProps;
  const didPointerDownRef = React.useRef(false);
  const textRef = React.useRef(null);
  const listItem = (0, _useCompositeListItem.useCompositeListItem)({
    index: indexProp,
    textRef,
    indexGuessBehavior: _useCompositeListItem.IndexGuessBehavior.GuessFromOrder
  });
  const store = (0, _ComboboxRootContext.useComboboxRootContext)();
  const isRow = (0, _ComboboxRowContext.useComboboxRowContext)();
  const {
    flatFilteredItems,
    hasItems
  } = (0, _ComboboxRootContext.useComboboxDerivedItemsContext)();
  const open = (0, _store.useStore)(store, _store2.selectors.open);
  const selectionMode = (0, _store.useStore)(store, _store2.selectors.selectionMode);
  const readOnly = (0, _store.useStore)(store, _store2.selectors.readOnly);
  const virtualized = (0, _store.useStore)(store, _store2.selectors.virtualized);
  const isItemEqualToValue = (0, _store.useStore)(store, _store2.selectors.isItemEqualToValue);
  const selectable = selectionMode !== 'none';
  const index = indexProp ?? (virtualized ? (0, _itemEquality.findItemIndex)(flatFilteredItems, itemValue, isItemEqualToValue) : listItem.index);
  const hasRegistered = listItem.index !== -1;
  const rootId = (0, _store.useStore)(store, _store2.selectors.id);
  const highlighted = (0, _store.useStore)(store, _store2.selectors.isActive, index);
  const matchesSelectedValue = (0, _store.useStore)(store, _store2.selectors.isSelected, itemValue);
  const getItemProps = (0, _store.useStore)(store, _store2.selectors.getItemProps);
  const itemRef = React.useRef(null);
  const id = rootId != null && hasRegistered ? `${rootId}-${index}` : undefined;
  const selected = matchesSelectedValue && selectable;
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    const shouldRun = hasRegistered && (virtualized || indexProp != null);
    if (!shouldRun) {
      return undefined;
    }
    const list = store.state.listRef.current;
    list[index] = itemRef.current;
    return () => {
      delete list[index];
    };
  }, [hasRegistered, virtualized, index, indexProp, store]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!hasRegistered || hasItems) {
      return undefined;
    }
    const visibleMap = store.state.valuesRef.current;
    visibleMap[index] = itemValue;

    // Stable registry that doesn't depend on filtering. Assume that no
    // filtering had occurred at this point; otherwise, an `items` prop is
    // required.
    if (selectionMode !== 'none') {
      store.state.allValuesRef.current.push(itemValue);
    }
    return () => {
      delete visibleMap[index];
    };
  }, [hasRegistered, hasItems, index, itemValue, store, selectionMode]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!open) {
      didPointerDownRef.current = false;
      return;
    }
    if (!hasRegistered || hasItems) {
      return;
    }
    const selectedValue = store.state.selectedValue;
    const lastSelectedValue = Array.isArray(selectedValue) ? selectedValue[selectedValue.length - 1] : selectedValue;
    if ((0, _itemEquality.compareItemEquality)(itemValue, lastSelectedValue, isItemEqualToValue)) {
      store.set('selectedIndex', index);
    }
  }, [hasRegistered, hasItems, open, store, index, itemValue, isItemEqualToValue]);
  const state = {
    disabled,
    selected,
    highlighted
  };
  const rootProps = getItemProps({
    active: highlighted,
    selected
  });
  rootProps.id = undefined;
  rootProps.onFocus = undefined;
  const {
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
    composite: true
  });
  function commitSelection(nativeEvent) {
    function selectItem() {
      store.state.handleSelection(nativeEvent, itemValue);
    }
    if (store.state.submitOnItemClick) {
      ReactDOM.flushSync(selectItem);
      store.state.requestSubmit();
    } else {
      selectItem();
    }
  }
  const defaultProps = {
    id,
    role: isRow ? 'gridcell' : 'option',
    'aria-selected': selectable ? selected : undefined,
    // Focusable items steal focus from the input upon mouseup.
    // Warn if the user renders a natively focusable element like `<button>`,
    // as it should be a `<div>` instead.
    tabIndex: undefined,
    onPointerDownCapture(event) {
      didPointerDownRef.current = true;
      event.preventDefault();
    },
    onClick(event) {
      if (disabled || readOnly) {
        return;
      }
      commitSelection(event.nativeEvent);
    },
    onMouseUp(event) {
      const pointerStartedOnItem = didPointerDownRef.current;
      didPointerDownRef.current = false;
      if (disabled || readOnly || event.button !== 0 || pointerStartedOnItem || !highlighted) {
        return;
      }
      commitSelection(event.nativeEvent);
    }
  };
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [buttonRef, forwardedRef, listItem.ref, itemRef],
    state,
    props: [rootProps, defaultProps, elementProps, getButtonProps]
  });
  const contextValue = React.useMemo(() => ({
    selected,
    textRef
  }), [selected, textRef]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_ComboboxItemContext.ComboboxItemContext.Provider, {
    value: contextValue,
    children: element
  });
}));
if (process.env.NODE_ENV !== "production") ComboboxItem.displayName = "ComboboxItem";