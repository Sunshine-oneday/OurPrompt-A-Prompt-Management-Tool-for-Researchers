'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useTimeout } from '@base-ui/utils/useTimeout';
import { ownerDocument } from '@base-ui/utils/owner';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useButton } from "../../use-button/index.js";
import { useComboboxFloatingContext, useComboboxDerivedItemsContext, useComboboxInputValueContext, useComboboxRootContext } from "../root/ComboboxRootContext.js";
import { triggerStateAttributesMapping } from "../utils/stateAttributesMapping.js";
import { selectors } from "../store.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { useLabelableContext } from "../../labelable-provider/LabelableContext.js";
import { stopEvent, contains, getTarget } from "../../floating-ui-react/utils.js";
import { getPseudoElementBounds } from "../../utils/getPseudoElementBounds.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useClick, useTypeahead } from "../../floating-ui-react/index.js";
import { useLabelableId } from "../../labelable-provider/useLabelableId.js";
import { resolveAriaLabelledBy } from "../../utils/resolveAriaLabelledBy.js";
const BOUNDARY_OFFSET = 2;

/**
 * A button that opens the popup.
 * Renders a `<button>` element.
 */
export const ComboboxTrigger = /*#__PURE__*/React.forwardRef(function ComboboxTrigger(componentProps, forwardedRef) {
  const {
    render,
    className,
    nativeButton = true,
    disabled: disabledProp = false,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    state: fieldState,
    disabled: fieldDisabled,
    setTouched,
    setFocused,
    validationMode,
    validation
  } = useFieldRootContext();
  const {
    labelId: fieldLabelId
  } = useLabelableContext();
  const store = useComboboxRootContext();
  const {
    filteredItems
  } = useComboboxDerivedItemsContext();
  const selectionMode = useStore(store, selectors.selectionMode);
  const comboboxDisabled = useStore(store, selectors.disabled);
  const readOnly = useStore(store, selectors.readOnly);
  const required = useStore(store, selectors.required);
  const mounted = useStore(store, selectors.mounted);
  const popupSideValue = useStore(store, selectors.popupSide);
  const positionerElement = useStore(store, selectors.positionerElement);
  const listElement = useStore(store, selectors.listElement);
  const triggerProps = useStore(store, selectors.triggerProps);
  const triggerElement = useStore(store, selectors.triggerElement);
  const inputInsidePopup = useStore(store, selectors.inputInsidePopup);
  const rootId = useStore(store, selectors.id);
  const comboboxLabelId = useStore(store, selectors.labelId);
  const open = useStore(store, selectors.open);
  const selectedValue = useStore(store, selectors.selectedValue);
  const activeIndex = useStore(store, selectors.activeIndex);
  const selectedIndex = useStore(store, selectors.selectedIndex);
  const hasSelectedValue = useStore(store, selectors.hasSelectedValue);
  const floatingRootContext = useComboboxFloatingContext();
  const inputValue = useComboboxInputValueContext();
  const focusTimeout = useTimeout();
  const disabled = fieldDisabled || comboboxDisabled || disabledProp;
  const listEmpty = filteredItems.length === 0;
  const popupSide = mounted && positionerElement ? popupSideValue : null;
  useLabelableId({
    id: inputInsidePopup ? idProp : undefined
  });
  const id = inputInsidePopup ? idProp ?? rootId : idProp;
  const ariaLabelledBy = resolveAriaLabelledBy(fieldLabelId, comboboxLabelId);
  const currentPointerTypeRef = React.useRef('');
  function trackPointerType(event) {
    currentPointerTypeRef.current = event.pointerType;
  }
  const domReference = floatingRootContext.useState('domReferenceElement');

  // Update the floating root context to use the trigger element when it differs from the current reference.
  // This ensures useClick and useTypeahead attach handlers to the correct element.
  React.useEffect(() => {
    if (!inputInsidePopup) {
      return;
    }
    if (triggerElement && triggerElement !== domReference) {
      floatingRootContext.set('domReferenceElement', triggerElement);
    }
  }, [triggerElement, domReference, floatingRootContext, inputInsidePopup]);
  const {
    reference: triggerTypeaheadProps
  } = useTypeahead(floatingRootContext, {
    enabled: !open && !readOnly && !comboboxDisabled && selectionMode === 'single',
    listRef: store.state.labelsRef,
    activeIndex,
    selectedIndex,
    onMatch(index) {
      const nextSelectedValue = store.state.valuesRef.current[index];
      if (nextSelectedValue !== undefined) {
        store.state.setSelectedValue(nextSelectedValue, createChangeEventDetails('none'));
      }
    }
  });
  const {
    reference: triggerClickProps
  } = useClick(floatingRootContext, {
    enabled: !readOnly && !comboboxDisabled,
    event: 'mousedown'
  });
  const {
    buttonRef,
    getButtonProps
  } = useButton({
    native: nativeButton,
    disabled
  });
  const state = {
    ...fieldState,
    open,
    disabled,
    popupSide,
    listEmpty,
    placeholder: !hasSelectedValue
  };
  const setTriggerElement = useStableCallback(element => {
    store.set('triggerElement', element);
  });
  const element = useRenderElement('button', componentProps, {
    ref: [forwardedRef, buttonRef, setTriggerElement],
    state,
    props: [triggerProps, triggerClickProps, triggerTypeaheadProps, {
      id,
      tabIndex: inputInsidePopup ? 0 : -1,
      role: inputInsidePopup ? 'combobox' : undefined,
      'aria-expanded': open ? 'true' : 'false',
      'aria-haspopup': inputInsidePopup ? 'dialog' : 'listbox',
      'aria-controls': open ? listElement?.id : undefined,
      'aria-required': inputInsidePopup ? required || undefined : undefined,
      'aria-labelledby': ariaLabelledBy,
      onPointerDown: trackPointerType,
      onPointerEnter: trackPointerType,
      onFocus() {
        setFocused(true);
        if (disabled || readOnly) {
          return;
        }
        focusTimeout.start(0, store.state.forceMount);
      },
      onBlur(event) {
        // If focus is moving into the popup, don't count it as a blur.
        if (contains(positionerElement, event.relatedTarget)) {
          return;
        }
        setTouched(true);
        setFocused(false);
        if (validationMode === 'onBlur') {
          const valueToValidate = selectionMode === 'none' ? inputValue : selectedValue;
          validation.commit(valueToValidate);
        }
      },
      onMouseDown(event) {
        if (disabled || readOnly) {
          return;
        }
        if (!inputInsidePopup) {
          floatingRootContext.set('domReferenceElement', event.currentTarget);
        }

        // Ensure items are registered for initial selection highlight.
        store.state.forceMount();
        if (currentPointerTypeRef.current !== 'touch') {
          store.state.inputRef.current?.focus();
          if (!inputInsidePopup) {
            event.preventDefault();
          }
        }
        if (open) {
          return;
        }
        const doc = ownerDocument(event.currentTarget);
        function handleMouseUp(mouseEvent) {
          if (!triggerElement) {
            return;
          }
          const mouseUpTarget = getTarget(mouseEvent);
          const positioner = store.state.positionerElement;
          const list = store.state.listElement;
          if (contains(triggerElement, mouseUpTarget) || contains(positioner, mouseUpTarget) || contains(list, mouseUpTarget) || mouseUpTarget === triggerElement) {
            return;
          }
          const bounds = getPseudoElementBounds(triggerElement);
          const withinHorizontal = mouseEvent.clientX >= bounds.left - BOUNDARY_OFFSET && mouseEvent.clientX <= bounds.right + BOUNDARY_OFFSET;
          const withinVertical = mouseEvent.clientY >= bounds.top - BOUNDARY_OFFSET && mouseEvent.clientY <= bounds.bottom + BOUNDARY_OFFSET;
          if (withinHorizontal && withinVertical) {
            return;
          }
          store.state.setOpen(false, createChangeEventDetails('cancel-open', mouseEvent));
        }
        if (inputInsidePopup) {
          doc.addEventListener('mouseup', handleMouseUp, {
            once: true
          });
        }
      },
      onKeyDown(event) {
        if (disabled || readOnly) {
          return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          stopEvent(event);
          store.state.setOpen(true, createChangeEventDetails(REASONS.listNavigation, event.nativeEvent));
          store.state.inputRef.current?.focus();
        }
      }
    }, validation ? validation.getValidationProps(elementProps) : elementProps, getButtonProps],
    stateAttributesMapping: triggerStateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") ComboboxTrigger.displayName = "ComboboxTrigger";