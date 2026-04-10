"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComboboxList = void 0;
var React = _interopRequireWildcard(require("react"));
var _store = require("@base-ui/utils/store");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useRenderElement = require("../../utils/useRenderElement");
var _ComboboxRootContext = require("../root/ComboboxRootContext");
var _ComboboxPositionerContext = require("../positioner/ComboboxPositionerContext");
var _store2 = require("../store");
var _ComboboxCollection2 = require("../collection/ComboboxCollection");
var _CompositeList = require("../../composite/list/CompositeList");
var _utils = require("../../floating-ui-react/utils");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * A list container for the items.
 * Renders a `<div>` element.
 */
const ComboboxList = exports.ComboboxList = /*#__PURE__*/React.forwardRef(function ComboboxList(componentProps, forwardedRef) {
  var _ComboboxCollection;
  const {
    render,
    className,
    children,
    ...elementProps
  } = componentProps;
  const store = (0, _ComboboxRootContext.useComboboxRootContext)();
  const floatingRootContext = (0, _ComboboxRootContext.useComboboxFloatingContext)();
  const hasPositionerContext = Boolean((0, _ComboboxPositionerContext.useComboboxPositionerContext)(true));
  const {
    filteredItems
  } = (0, _ComboboxRootContext.useComboboxDerivedItemsContext)();
  const items = (0, _store.useStore)(store, _store2.selectors.items);
  const labelsRef = (0, _store.useStore)(store, _store2.selectors.labelsRef);
  const listRef = (0, _store.useStore)(store, _store2.selectors.listRef);
  const selectionMode = (0, _store.useStore)(store, _store2.selectors.selectionMode);
  const grid = (0, _store.useStore)(store, _store2.selectors.grid);
  const popupProps = (0, _store.useStore)(store, _store2.selectors.popupProps);
  const disabled = (0, _store.useStore)(store, _store2.selectors.disabled);
  const readOnly = (0, _store.useStore)(store, _store2.selectors.readOnly);
  const virtualized = (0, _store.useStore)(store, _store2.selectors.virtualized);
  const multiple = selectionMode === 'multiple';
  const empty = filteredItems.length === 0;
  const setPositionerElement = (0, _useStableCallback.useStableCallback)(element => {
    store.set('positionerElement', element);
  });
  const setListElement = (0, _useStableCallback.useStableCallback)(element => {
    store.set('listElement', element);
  });

  // Support "closed template" API: if children is a function, implicitly wrap it
  // with a Combobox.Collection that reads items from context/root.
  // Ensures this component's `popupProps` subscription does not cause <Combobox.Item>
  // to re-render on every active index change.
  const resolvedChildren = React.useMemo(() => {
    if (typeof children === 'function') {
      return _ComboboxCollection || (_ComboboxCollection = /*#__PURE__*/(0, _jsxRuntime.jsx)(_ComboboxCollection2.ComboboxCollection, {
        children: children
      }));
    }
    return children;
  }, [children]);
  const state = {
    empty
  };
  const floatingId = floatingRootContext.useState('floatingId');
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    ref: [forwardedRef, setListElement, hasPositionerContext ? null : setPositionerElement],
    props: [popupProps, {
      children: resolvedChildren,
      tabIndex: -1,
      id: floatingId,
      role: grid ? 'grid' : 'listbox',
      'aria-multiselectable': multiple ? 'true' : undefined,
      onKeyDown(event) {
        if (disabled || readOnly) {
          return;
        }
        if (event.key === 'Enter') {
          const activeIndex = store.state.activeIndex;
          if (activeIndex == null) {
            // Allow form submission when no item is highlighted.
            return;
          }
          (0, _utils.stopEvent)(event);
          const nativeEvent = event.nativeEvent;
          const listItem = store.state.listRef.current[activeIndex];
          if (listItem) {
            store.state.selectionEventRef.current = nativeEvent;
            listItem.click();
            store.state.selectionEventRef.current = null;
          }
        }
      },
      onKeyDownCapture() {
        store.state.keyboardActiveRef.current = true;
      },
      onPointerMoveCapture() {
        store.state.keyboardActiveRef.current = false;
      }
    }, elementProps]
  });
  if (virtualized) {
    return element;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_CompositeList.CompositeList, {
    elementsRef: listRef,
    labelsRef: items ? undefined : labelsRef,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ComboboxList.displayName = "ComboboxList";