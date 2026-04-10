"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectRoot = SelectRoot;
var React = _interopRequireWildcard(require("react"));
var _visuallyHidden = require("@base-ui/utils/visuallyHidden");
var _useMergedRefs = require("@base-ui/utils/useMergedRefs");
var _useRefWithInit = require("@base-ui/utils/useRefWithInit");
var _useOnFirstRender = require("@base-ui/utils/useOnFirstRender");
var _useControlled = require("@base-ui/utils/useControlled");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _useValueAsRef = require("@base-ui/utils/useValueAsRef");
var _store = require("@base-ui/utils/store");
var _floatingUiReact = require("../../floating-ui-react");
var _SelectRootContext = require("./SelectRootContext");
var _FieldRootContext = require("../../field/root/FieldRootContext");
var _useLabelableId = require("../../labelable-provider/useLabelableId");
var _useTransitionStatus = require("../../utils/useTransitionStatus");
var _store2 = require("../store");
var _createBaseUIEventDetails = require("../../utils/createBaseUIEventDetails");
var _reasons = require("../../utils/reasons");
var _useOpenChangeComplete = require("../../utils/useOpenChangeComplete");
var _FormContext = require("../../form/FormContext");
var _useField = require("../../field/useField");
var _resolveValueLabel = require("../../utils/resolveValueLabel");
var _constants = require("../../utils/constants");
var _itemEquality = require("../../utils/itemEquality");
var _useValueChanged = require("../../utils/useValueChanged");
var _useOpenInteractionType = require("../../utils/useOpenInteractionType");
var _mergeProps = require("../../merge-props");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Groups all parts of the select.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
function SelectRoot(props) {
  const {
    id,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    name: nameProp,
    autoComplete,
    disabled: disabledProp = false,
    readOnly = false,
    required = false,
    modal = true,
    actionsRef,
    inputRef,
    onOpenChangeComplete,
    items,
    multiple = false,
    itemToStringLabel,
    itemToStringValue,
    isItemEqualToValue = _itemEquality.defaultItemEquality,
    highlightItemOnHover = true,
    children
  } = props;
  const {
    clearErrors
  } = (0, _FormContext.useFormContext)();
  const {
    setDirty,
    setTouched,
    setFocused,
    shouldValidateOnChange,
    validityData,
    setFilled,
    name: fieldName,
    disabled: fieldDisabled,
    validation,
    validationMode
  } = (0, _FieldRootContext.useFieldRootContext)();
  const generatedId = (0, _useLabelableId.useLabelableId)({
    id
  });
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const [value, setValueUnwrapped] = (0, _useControlled.useControlled)({
    controlled: valueProp,
    default: multiple ? defaultValue ?? _constants.EMPTY_ARRAY : defaultValue,
    name: 'Select',
    state: 'value'
  });
  const [open, setOpenUnwrapped] = (0, _useControlled.useControlled)({
    controlled: openProp,
    default: defaultOpen,
    name: 'Select',
    state: 'open'
  });
  const listRef = React.useRef([]);
  const labelsRef = React.useRef([]);
  const popupRef = React.useRef(null);
  const scrollHandlerRef = React.useRef(null);
  const scrollArrowsMountedCountRef = React.useRef(0);
  const valueRef = React.useRef(null);
  const valuesRef = React.useRef([]);
  const typingRef = React.useRef(false);
  const keyboardActiveRef = React.useRef(false);
  const selectedItemTextRef = React.useRef(null);
  const selectionRef = React.useRef({
    allowSelectedMouseUp: false,
    allowUnselectedMouseUp: false
  });
  const alignItemWithTriggerActiveRef = React.useRef(false);
  const {
    mounted,
    setMounted,
    transitionStatus
  } = (0, _useTransitionStatus.useTransitionStatus)(open);
  const {
    openMethod,
    triggerProps: interactionTypeProps
  } = (0, _useOpenInteractionType.useOpenInteractionType)(open);
  const store = (0, _useRefWithInit.useRefWithInit)(() => new _store.Store({
    id: generatedId,
    labelId: undefined,
    modal,
    multiple,
    itemToStringLabel,
    itemToStringValue,
    isItemEqualToValue,
    value,
    open,
    mounted,
    transitionStatus,
    items,
    forceMount: false,
    openMethod: null,
    activeIndex: null,
    selectedIndex: null,
    popupProps: {},
    triggerProps: {},
    triggerElement: null,
    positionerElement: null,
    listElement: null,
    scrollUpArrowVisible: false,
    scrollDownArrowVisible: false,
    hasScrollArrows: false
  })).current;
  const activeIndex = (0, _store.useStore)(store, _store2.selectors.activeIndex);
  const selectedIndex = (0, _store.useStore)(store, _store2.selectors.selectedIndex);
  const triggerElement = (0, _store.useStore)(store, _store2.selectors.triggerElement);
  const positionerElement = (0, _store.useStore)(store, _store2.selectors.positionerElement);
  const serializedValue = React.useMemo(() => {
    if (multiple && Array.isArray(value) && value.length === 0) {
      return '';
    }
    return (0, _resolveValueLabel.stringifyAsValue)(value, itemToStringValue);
  }, [multiple, value, itemToStringValue]);
  const fieldStringValue = React.useMemo(() => {
    if (multiple && Array.isArray(value)) {
      return value.map(currentValue => (0, _resolveValueLabel.stringifyAsValue)(currentValue, itemToStringValue));
    }
    return (0, _resolveValueLabel.stringifyAsValue)(value, itemToStringValue);
  }, [multiple, value, itemToStringValue]);
  const controlRef = (0, _useValueAsRef.useValueAsRef)(store.state.triggerElement);
  (0, _useField.useField)({
    id: generatedId,
    commit: validation.commit,
    value,
    controlRef,
    name,
    getValue: () => fieldStringValue
  });
  const initialValueRef = React.useRef(value);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    // Ensure the values and labels are registered for programmatic value changes.
    if (value !== initialValueRef.current) {
      store.set('forceMount', true);
    }
  }, [store, value]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    setFilled(multiple ? Array.isArray(value) && value.length > 0 : value != null);
  }, [multiple, value, setFilled]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(function syncSelectedIndex() {
    if (open) {
      return;
    }
    const registry = valuesRef.current;
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      if (currentValue.length === 0) {
        store.set('selectedIndex', null);
        return;
      }
      const lastValue = currentValue[currentValue.length - 1];
      const lastIndex = (0, _itemEquality.findItemIndex)(registry, lastValue, isItemEqualToValue);
      store.set('selectedIndex', lastIndex === -1 ? null : lastIndex);
      return;
    }
    const index = (0, _itemEquality.findItemIndex)(registry, value, isItemEqualToValue);
    store.set('selectedIndex', index === -1 ? null : index);
  }, [multiple, open, value, valuesRef, isItemEqualToValue, store]);
  (0, _useValueChanged.useValueChanged)(value, () => {
    clearErrors(name);
    setDirty(value !== validityData.initialValue);
    if (shouldValidateOnChange()) {
      validation.commit(value);
    } else {
      validation.commit(value, true);
    }
  });
  const setOpen = (0, _useStableCallback.useStableCallback)((nextOpen, eventDetails) => {
    onOpenChange?.(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setOpenUnwrapped(nextOpen);
    if (!nextOpen && (eventDetails.reason === _reasons.REASONS.focusOut || eventDetails.reason === _reasons.REASONS.outsidePress)) {
      setTouched(true);
      setFocused(false);
      if (validationMode === 'onBlur') {
        validation.commit(value);
      }
    }

    // The active index will sync to the last selected index on the next open.
    // Workaround `enableFocusInside` in Floating UI setting `tabindex=0` of a non-highlighted
    // option upon close when tabbing out due to `keepMounted=true`:
    // https://github.com/floating-ui/floating-ui/pull/3004/files#diff-962a7439cdeb09ea98d4b622a45d517bce07ad8c3f866e089bda05f4b0bbd875R194-R199
    // This otherwise causes options to retain `tabindex=0` incorrectly when the popup is closed
    // when tabbing outside.
    if (!nextOpen && store.state.activeIndex !== null) {
      const activeOption = listRef.current[store.state.activeIndex];
      // Wait for Floating UI's focus effect to have fired
      queueMicrotask(() => {
        activeOption?.setAttribute('tabindex', '-1');
      });
    }
  });
  const handleUnmount = (0, _useStableCallback.useStableCallback)(() => {
    setMounted(false);
    store.set('activeIndex', null);
    onOpenChangeComplete?.(false);
  });
  (0, _useOpenChangeComplete.useOpenChangeComplete)({
    enabled: !actionsRef,
    open,
    ref: popupRef,
    onComplete() {
      if (!open) {
        handleUnmount();
      }
    }
  });
  React.useImperativeHandle(actionsRef, () => ({
    unmount: handleUnmount
  }), [handleUnmount]);
  const setValue = (0, _useStableCallback.useStableCallback)((nextValue, eventDetails) => {
    onValueChange?.(nextValue, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setValueUnwrapped(nextValue);
  });
  const handleScrollArrowVisibility = (0, _useStableCallback.useStableCallback)(() => {
    const scroller = store.state.listElement || popupRef.current;
    if (!scroller) {
      return;
    }
    const viewportTop = scroller.scrollTop;
    const viewportBottom = scroller.scrollTop + scroller.clientHeight;
    const shouldShowUp = viewportTop > 1;
    const shouldShowDown = viewportBottom < scroller.scrollHeight - 1;
    if (store.state.scrollUpArrowVisible !== shouldShowUp) {
      store.set('scrollUpArrowVisible', shouldShowUp);
    }
    if (store.state.scrollDownArrowVisible !== shouldShowDown) {
      store.set('scrollDownArrowVisible', shouldShowDown);
    }
  });
  const floatingContext = (0, _floatingUiReact.useFloatingRootContext)({
    open,
    onOpenChange: setOpen,
    elements: {
      reference: triggerElement,
      floating: positionerElement
    }
  });
  const click = (0, _floatingUiReact.useClick)(floatingContext, {
    enabled: !readOnly && !disabled,
    event: 'mousedown'
  });
  const dismiss = (0, _floatingUiReact.useDismiss)(floatingContext, {
    bubbles: false
  });
  const listNavigation = (0, _floatingUiReact.useListNavigation)(floatingContext, {
    enabled: !readOnly && !disabled,
    listRef,
    activeIndex,
    selectedIndex,
    disabledIndices: _constants.EMPTY_ARRAY,
    onNavigate(nextActiveIndex) {
      // Retain the highlight while transitioning out.
      if (nextActiveIndex === null && !open) {
        return;
      }
      store.set('activeIndex', nextActiveIndex);
    },
    // Implement our own listeners since `onPointerLeave` on each option fires while scrolling with
    // the `alignItemWithTrigger=true`, causing a performance issue on Chrome.
    focusItemOnHover: false
  });
  const typeahead = (0, _floatingUiReact.useTypeahead)(floatingContext, {
    enabled: !readOnly && !disabled && (open || !multiple),
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    onMatch(index) {
      if (open) {
        store.set('activeIndex', index);
      } else {
        setValue(valuesRef.current[index], (0, _createBaseUIEventDetails.createChangeEventDetails)('none'));
      }
    },
    onTypingChange(typing) {
      typingRef.current = typing;
    }
  });
  const {
    getReferenceProps,
    getFloatingProps,
    getItemProps
  } = (0, _floatingUiReact.useInteractions)([click, dismiss, listNavigation, typeahead]);
  const mergedTriggerProps = React.useMemo(() => {
    return (0, _mergeProps.mergeProps)(getReferenceProps(), interactionTypeProps, generatedId ? {
      id: generatedId
    } : _constants.EMPTY_OBJECT);
  }, [getReferenceProps, interactionTypeProps, generatedId]);
  (0, _useOnFirstRender.useOnFirstRender)(() => {
    store.update({
      popupProps: getFloatingProps(),
      triggerProps: mergedTriggerProps
    });
  });
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    store.update({
      id: generatedId,
      modal,
      multiple,
      value,
      open,
      mounted,
      transitionStatus,
      popupProps: getFloatingProps(),
      triggerProps: mergedTriggerProps,
      items,
      itemToStringLabel,
      itemToStringValue,
      isItemEqualToValue,
      openMethod
    });
  }, [store, generatedId, modal, multiple, value, open, mounted, transitionStatus, getFloatingProps, mergedTriggerProps, items, itemToStringLabel, itemToStringValue, isItemEqualToValue, openMethod]);
  const contextValue = React.useMemo(() => ({
    store,
    name,
    required,
    disabled,
    readOnly,
    multiple,
    itemToStringLabel,
    itemToStringValue,
    highlightItemOnHover,
    setValue,
    setOpen,
    listRef,
    popupRef,
    scrollHandlerRef,
    handleScrollArrowVisibility,
    scrollArrowsMountedCountRef,
    getItemProps,
    events: floatingContext.context.events,
    valueRef,
    valuesRef,
    labelsRef,
    typingRef,
    selectionRef,
    selectedItemTextRef,
    validation,
    onOpenChangeComplete,
    keyboardActiveRef,
    alignItemWithTriggerActiveRef,
    initialValueRef
  }), [store, name, required, disabled, readOnly, multiple, itemToStringLabel, itemToStringValue, highlightItemOnHover, setValue, setOpen, getItemProps, floatingContext.context.events, validation, onOpenChangeComplete, handleScrollArrowVisibility]);
  const ref = (0, _useMergedRefs.useMergedRefs)(inputRef, validation.inputRef);
  const hasMultipleSelection = multiple && Array.isArray(value) && value.length > 0;
  const hiddenInputName = multiple ? undefined : name;
  const hiddenInputs = React.useMemo(() => {
    if (!multiple || !Array.isArray(value) || !name) {
      return null;
    }
    return value.map(v => {
      const currentSerializedValue = (0, _resolveValueLabel.stringifyAsValue)(v, itemToStringValue);
      return /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
        type: "hidden",
        name: name,
        value: currentSerializedValue
      }, currentSerializedValue);
    });
  }, [multiple, value, name, itemToStringValue]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_SelectRootContext.SelectRootContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_SelectRootContext.SelectFloatingContext.Provider, {
      value: floatingContext,
      children: [children, /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
        ...validation.getInputValidationProps({
          onFocus() {
            // Move focus to the trigger element when the hidden input is focused.
            store.state.triggerElement?.focus({
              // Supported in Chrome from 144 (January 2026)
              // @ts-expect-error - focusVisible is not yet in the lib.dom.d.ts
              focusVisible: true
            });
          },
          // Handle browser autofill.
          onChange(event) {
            // Workaround for https://github.com/facebook/react/issues/9023
            if (event.nativeEvent.defaultPrevented) {
              return;
            }
            const nextValue = event.target.value;
            const details = (0, _createBaseUIEventDetails.createChangeEventDetails)(_reasons.REASONS.none, event.nativeEvent);
            function handleChange() {
              if (multiple) {
                // Browser autofill only writes a single scalar value.
                return;
              }

              // Handle single selection: match against registered values using serialization
              const matchingValue = valuesRef.current.find(v => {
                const candidate = (0, _resolveValueLabel.stringifyAsValue)(v, itemToStringValue);
                if (candidate.toLowerCase() === nextValue.toLowerCase()) {
                  return true;
                }
                return false;
              });
              if (matchingValue != null) {
                setDirty(matchingValue !== validityData.initialValue);
                setValue(matchingValue, details);
                if (shouldValidateOnChange()) {
                  validation.commit(matchingValue);
                }
              }
            }
            store.set('forceMount', true);
            queueMicrotask(handleChange);
          }
        }),
        id: generatedId && hiddenInputName == null ? `${generatedId}-hidden-input` : undefined,
        name: hiddenInputName,
        autoComplete: autoComplete,
        value: serializedValue,
        disabled: disabled,
        required: required && !hasMultipleSelection,
        readOnly: readOnly,
        ref: ref,
        style: name ? _visuallyHidden.visuallyHiddenInput : _visuallyHidden.visuallyHidden,
        tabIndex: -1,
        "aria-hidden": true
      }), hiddenInputs]
    })
  });
}