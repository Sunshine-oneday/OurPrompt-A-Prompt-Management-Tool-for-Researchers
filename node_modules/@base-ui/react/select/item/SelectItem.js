"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectItem = void 0;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useValueAsRef = require("@base-ui/utils/useValueAsRef");
var _isMouseWithinBounds = require("@base-ui/utils/isMouseWithinBounds");
var _useTimeout = require("@base-ui/utils/useTimeout");
var _store = require("@base-ui/utils/store");
var _SelectRootContext = require("../root/SelectRootContext");
var _useCompositeListItem = require("../../composite/list/useCompositeListItem");
var _useRenderElement = require("../../utils/useRenderElement");
var _SelectItemContext = require("./SelectItemContext");
var _store2 = require("../store");
var _useButton = require("../../use-button");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _itemEquality = require("../../utils/itemEquality");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * An individual option in the select popup.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
const SelectItem = exports.SelectItem = /*#__PURE__*/React.memo(/*#__PURE__*/React.forwardRef(function SelectItem(componentProps, forwardedRef) {
  const {
    render,
    className,
    value: itemValue = null,
    label,
    disabled = false,
    nativeButton = false,
    ...elementProps
  } = componentProps;
  const textRef = React.useRef(null);
  const listItem = (0, _useCompositeListItem.useCompositeListItem)({
    label,
    textRef,
    indexGuessBehavior: _useCompositeListItem.IndexGuessBehavior.GuessFromOrder
  });
  const {
    store,
    getItemProps,
    setOpen,
    setValue,
    selectionRef,
    typingRef,
    valuesRef,
    keyboardActiveRef,
    multiple,
    highlightItemOnHover
  } = (0, _SelectRootContext.useSelectRootContext)();
  const highlightTimeout = (0, _useTimeout.useTimeout)();
  const highlighted = (0, _store.useStore)(store, _store2.selectors.isActive, listItem.index);
  const selected = (0, _store.useStore)(store, _store2.selectors.isSelected, listItem.index, itemValue);
  const selectedByFocus = (0, _store.useStore)(store, _store2.selectors.isSelectedByFocus, listItem.index);
  const isItemEqualToValue = (0, _store.useStore)(store, _store2.selectors.isItemEqualToValue);
  const index = listItem.index;
  const hasRegistered = index !== -1;
  const itemRef = React.useRef(null);
  const indexRef = (0, _useValueAsRef.useValueAsRef)(index);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!hasRegistered) {
      return undefined;
    }
    const values = valuesRef.current;
    values[index] = itemValue;
    return () => {
      delete values[index];
    };
  }, [hasRegistered, index, itemValue, valuesRef]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!hasRegistered) {
      return undefined;
    }
    const selectedValue = store.state.value;
    let selectedCandidate = selectedValue;
    if (multiple && Array.isArray(selectedValue) && selectedValue.length > 0) {
      selectedCandidate = selectedValue[selectedValue.length - 1];
    }
    if (selectedCandidate !== undefined && (0, _itemEquality.compareItemEquality)(itemValue, selectedCandidate, isItemEqualToValue)) {
      store.set('selectedIndex', index);
    }
    return undefined;
  }, [hasRegistered, index, multiple, isItemEqualToValue, store, itemValue]);
  const state = {
    disabled,
    selected,
    highlighted
  };
  const rootProps = getItemProps({
    active: highlighted,
    selected
  });
  // With our custom `focusItemOnHover` implementation, this interferes with the logic and can
  // cause the index state to be stuck when leaving the select popup.
  rootProps.onFocus = undefined;
  rootProps.id = undefined;
  const lastKeyRef = React.useRef(null);
  const pointerTypeRef = React.useRef('mouse');
  const didPointerDownRef = React.useRef(false);
  const {
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
    composite: true
  });
  function commitSelection(event) {
    const selectedValue = store.state.value;
    if (multiple) {
      const currentValue = Array.isArray(selectedValue) ? selectedValue : [];
      const nextValue = selected ? (0, _itemEquality.removeItem)(currentValue, itemValue, isItemEqualToValue) : [...currentValue, itemValue];
      setValue(nextValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.itemPress, event));
    } else {
      setValue(itemValue, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.itemPress, event));
      setOpen(false, (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.itemPress, event));
    }
  }
  const defaultProps = {
    role: 'option',
    'aria-selected': selected,
    tabIndex: highlighted ? 0 : -1,
    onFocus() {
      store.set('activeIndex', index);
    },
    onMouseEnter() {
      if (!keyboardActiveRef.current && store.state.selectedIndex === null && highlightItemOnHover) {
        store.set('activeIndex', index);
      }
    },
    onMouseMove() {
      if (highlightItemOnHover) {
        store.set('activeIndex', index);
      }
    },
    onMouseLeave(event) {
      if (!highlightItemOnHover || keyboardActiveRef.current || (0, _isMouseWithinBounds.isMouseWithinBounds)(event)) {
        return;
      }
      highlightTimeout.start(0, () => {
        if (store.state.activeIndex === index) {
          store.set('activeIndex', null);
        }
      });
    },
    onTouchStart() {
      selectionRef.current = {
        allowSelectedMouseUp: false,
        allowUnselectedMouseUp: false
      };
    },
    onKeyDown(event) {
      lastKeyRef.current = event.key;
      store.set('activeIndex', index);
      if (event.key === ' ' && typingRef.current) {
        event.preventDefault();
      }
    },
    onClick(event) {
      didPointerDownRef.current = false;

      // Prevent double commit on {Enter}
      if (event.type === 'keydown' && lastKeyRef.current === null) {
        return;
      }
      if (disabled || event.type === 'keydown' && lastKeyRef.current === ' ' && typingRef.current || pointerTypeRef.current !== 'touch' && !highlighted) {
        return;
      }
      lastKeyRef.current = null;
      commitSelection(event.nativeEvent);
    },
    onPointerEnter(event) {
      pointerTypeRef.current = event.pointerType;
    },
    onPointerDown(event) {
      pointerTypeRef.current = event.pointerType;
      didPointerDownRef.current = true;
    },
    onMouseUp() {
      if (disabled) {
        return;
      }

      // Regular click (pointerdown on this element) if didPointerDownRef is set, otherwise drag-to-select
      if (didPointerDownRef.current) {
        didPointerDownRef.current = false;
        return;
      }
      const disallowSelectedMouseUp = !selectionRef.current.allowSelectedMouseUp && selected;
      const disallowUnselectedMouseUp = !selectionRef.current.allowUnselectedMouseUp && !selected;
      if (disallowSelectedMouseUp || disallowUnselectedMouseUp || pointerTypeRef.current !== 'touch' && !highlighted) {
        return;
      }
      itemRef.current?.click();
    }
  };
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    ref: [buttonRef, forwardedRef, listItem.ref, itemRef],
    state,
    props: [rootProps, defaultProps, elementProps, getButtonProps]
  });
  const contextValue = React.useMemo(() => ({
    selected,
    indexRef,
    textRef,
    selectedByFocus,
    hasRegistered
  }), [selected, indexRef, textRef, selectedByFocus, hasRegistered]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_SelectItemContext.SelectItemContext.Provider, {
    value: contextValue,
    children: element
  });
}));
if (process.env.NODE_ENV !== "production") SelectItem.displayName = "SelectItem";