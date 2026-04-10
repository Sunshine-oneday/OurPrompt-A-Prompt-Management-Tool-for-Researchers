'use client';

import * as React from 'react';
import { visuallyHidden, visuallyHiddenInput } from '@base-ui/utils/visuallyHidden';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useRefWithInit } from '@base-ui/utils/useRefWithInit';
import { useOnFirstRender } from '@base-ui/utils/useOnFirstRender';
import { useControlled } from '@base-ui/utils/useControlled';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useValueAsRef } from '@base-ui/utils/useValueAsRef';
import { useStore, Store } from '@base-ui/utils/store';
import { useClick, useDismiss, useFloatingRootContext, useInteractions, useListNavigation, useTypeahead } from "../../floating-ui-react/index.js";
import { SelectRootContext, SelectFloatingContext } from "./SelectRootContext.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { useLabelableId } from "../../labelable-provider/useLabelableId.js";
import { useTransitionStatus } from "../../utils/useTransitionStatus.js";
import { selectors } from "../store.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { useFormContext } from "../../form/FormContext.js";
import { useField } from "../../field/useField.js";
import { stringifyAsValue } from "../../utils/resolveValueLabel.js";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "../../utils/constants.js";
import { defaultItemEquality, findItemIndex } from "../../utils/itemEquality.js";
import { useValueChanged } from "../../utils/useValueChanged.js";
import { useOpenInteractionType } from "../../utils/useOpenInteractionType.js";
import { mergeProps } from "../../merge-props/index.js";

/**
 * Groups all parts of the select.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SelectRoot(props) {
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
    isItemEqualToValue = defaultItemEquality,
    highlightItemOnHover = true,
    children
  } = props;
  const {
    clearErrors
  } = useFormContext();
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
  } = useFieldRootContext();
  const generatedId = useLabelableId({
    id
  });
  const disabled = fieldDisabled || disabledProp;
  const name = fieldName ?? nameProp;
  const [value, setValueUnwrapped] = useControlled({
    controlled: valueProp,
    default: multiple ? defaultValue ?? EMPTY_ARRAY : defaultValue,
    name: 'Select',
    state: 'value'
  });
  const [open, setOpenUnwrapped] = useControlled({
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
  } = useTransitionStatus(open);
  const {
    openMethod,
    triggerProps: interactionTypeProps
  } = useOpenInteractionType(open);
  const store = useRefWithInit(() => new Store({
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
  const activeIndex = useStore(store, selectors.activeIndex);
  const selectedIndex = useStore(store, selectors.selectedIndex);
  const triggerElement = useStore(store, selectors.triggerElement);
  const positionerElement = useStore(store, selectors.positionerElement);
  const serializedValue = React.useMemo(() => {
    if (multiple && Array.isArray(value) && value.length === 0) {
      return '';
    }
    return stringifyAsValue(value, itemToStringValue);
  }, [multiple, value, itemToStringValue]);
  const fieldStringValue = React.useMemo(() => {
    if (multiple && Array.isArray(value)) {
      return value.map(currentValue => stringifyAsValue(currentValue, itemToStringValue));
    }
    return stringifyAsValue(value, itemToStringValue);
  }, [multiple, value, itemToStringValue]);
  const controlRef = useValueAsRef(store.state.triggerElement);
  useField({
    id: generatedId,
    commit: validation.commit,
    value,
    controlRef,
    name,
    getValue: () => fieldStringValue
  });
  const initialValueRef = React.useRef(value);
  useIsoLayoutEffect(() => {
    // Ensure the values and labels are registered for programmatic value changes.
    if (value !== initialValueRef.current) {
      store.set('forceMount', true);
    }
  }, [store, value]);
  useIsoLayoutEffect(() => {
    setFilled(multiple ? Array.isArray(value) && value.length > 0 : value != null);
  }, [multiple, value, setFilled]);
  useIsoLayoutEffect(function syncSelectedIndex() {
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
      const lastIndex = findItemIndex(registry, lastValue, isItemEqualToValue);
      store.set('selectedIndex', lastIndex === -1 ? null : lastIndex);
      return;
    }
    const index = findItemIndex(registry, value, isItemEqualToValue);
    store.set('selectedIndex', index === -1 ? null : index);
  }, [multiple, open, value, valuesRef, isItemEqualToValue, store]);
  useValueChanged(value, () => {
    clearErrors(name);
    setDirty(value !== validityData.initialValue);
    if (shouldValidateOnChange()) {
      validation.commit(value);
    } else {
      validation.commit(value, true);
    }
  });
  const setOpen = useStableCallback((nextOpen, eventDetails) => {
    onOpenChange?.(nextOpen, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setOpenUnwrapped(nextOpen);
    if (!nextOpen && (eventDetails.reason === REASONS.focusOut || eventDetails.reason === REASONS.outsidePress)) {
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
  const handleUnmount = useStableCallback(() => {
    setMounted(false);
    store.set('activeIndex', null);
    onOpenChangeComplete?.(false);
  });
  useOpenChangeComplete({
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
  const setValue = useStableCallback((nextValue, eventDetails) => {
    onValueChange?.(nextValue, eventDetails);
    if (eventDetails.isCanceled) {
      return;
    }
    setValueUnwrapped(nextValue);
  });
  const handleScrollArrowVisibility = useStableCallback(() => {
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
  const floatingContext = useFloatingRootContext({
    open,
    onOpenChange: setOpen,
    elements: {
      reference: triggerElement,
      floating: positionerElement
    }
  });
  const click = useClick(floatingContext, {
    enabled: !readOnly && !disabled,
    event: 'mousedown'
  });
  const dismiss = useDismiss(floatingContext, {
    bubbles: false
  });
  const listNavigation = useListNavigation(floatingContext, {
    enabled: !readOnly && !disabled,
    listRef,
    activeIndex,
    selectedIndex,
    disabledIndices: EMPTY_ARRAY,
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
  const typeahead = useTypeahead(floatingContext, {
    enabled: !readOnly && !disabled && (open || !multiple),
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    onMatch(index) {
      if (open) {
        store.set('activeIndex', index);
      } else {
        setValue(valuesRef.current[index], createChangeEventDetails('none'));
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
  } = useInteractions([click, dismiss, listNavigation, typeahead]);
  const mergedTriggerProps = React.useMemo(() => {
    return mergeProps(getReferenceProps(), interactionTypeProps, generatedId ? {
      id: generatedId
    } : EMPTY_OBJECT);
  }, [getReferenceProps, interactionTypeProps, generatedId]);
  useOnFirstRender(() => {
    store.update({
      popupProps: getFloatingProps(),
      triggerProps: mergedTriggerProps
    });
  });
  useIsoLayoutEffect(() => {
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
  const ref = useMergedRefs(inputRef, validation.inputRef);
  const hasMultipleSelection = multiple && Array.isArray(value) && value.length > 0;
  const hiddenInputName = multiple ? undefined : name;
  const hiddenInputs = React.useMemo(() => {
    if (!multiple || !Array.isArray(value) || !name) {
      return null;
    }
    return value.map(v => {
      const currentSerializedValue = stringifyAsValue(v, itemToStringValue);
      return /*#__PURE__*/_jsx("input", {
        type: "hidden",
        name: name,
        value: currentSerializedValue
      }, currentSerializedValue);
    });
  }, [multiple, value, name, itemToStringValue]);
  return /*#__PURE__*/_jsx(SelectRootContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsxs(SelectFloatingContext.Provider, {
      value: floatingContext,
      children: [children, /*#__PURE__*/_jsx("input", {
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
            const details = createChangeEventDetails(REASONS.none, event.nativeEvent);
            function handleChange() {
              if (multiple) {
                // Browser autofill only writes a single scalar value.
                return;
              }

              // Handle single selection: match against registered values using serialization
              const matchingValue = valuesRef.current.find(v => {
                const candidate = stringifyAsValue(v, itemToStringValue);
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
        style: name ? visuallyHiddenInput : visuallyHidden,
        tabIndex: -1,
        "aria-hidden": true
      }), hiddenInputs]
    })
  });
}