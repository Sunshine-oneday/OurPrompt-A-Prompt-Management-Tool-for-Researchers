'use client';

import * as React from 'react';
import { ownerDocument } from '@base-ui/utils/owner';
import { useTimeout } from '@base-ui/utils/useTimeout';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useValueAsRef } from '@base-ui/utils/useValueAsRef';
import { useStore } from '@base-ui/utils/store';
import { useSelectRootContext } from "../root/SelectRootContext.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { useLabelableContext } from "../../labelable-provider/LabelableContext.js";
import { pressableTriggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { fieldValidityMapping } from "../../field/utils/constants.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { selectors } from "../store.js";
import { getPseudoElementBounds } from "../../utils/getPseudoElementBounds.js";
import { contains, getFloatingFocusElement } from "../../floating-ui-react/utils.js";
import { mergeProps } from "../../merge-props/index.js";
import { useButton } from "../../use-button/index.js";
import { createChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
import { useLabelableId } from "../../labelable-provider/useLabelableId.js";
import { resolveAriaLabelledBy } from "../../utils/resolveAriaLabelledBy.js";
const BOUNDARY_OFFSET = 2;
const SELECTED_DELAY = 400;
const UNSELECTED_DELAY = 200;
const stateAttributesMapping = {
  ...pressableTriggerOpenStateMapping,
  ...fieldValidityMapping,
  value: () => null
};

/**
 * A button that opens the select popup.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
export const SelectTrigger = /*#__PURE__*/React.forwardRef(function SelectTrigger(componentProps, forwardedRef) {
  const {
    render,
    className,
    id: idProp,
    disabled: disabledProp = false,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    setTouched,
    setFocused,
    validationMode,
    state: fieldState,
    disabled: fieldDisabled
  } = useFieldRootContext();
  const {
    labelId: fieldLabelId
  } = useLabelableContext();
  const {
    store,
    setOpen,
    selectionRef,
    validation,
    readOnly,
    required,
    alignItemWithTriggerActiveRef,
    disabled: selectDisabled,
    keyboardActiveRef
  } = useSelectRootContext();
  const disabled = fieldDisabled || selectDisabled || disabledProp;
  const open = useStore(store, selectors.open);
  const value = useStore(store, selectors.value);
  const triggerProps = useStore(store, selectors.triggerProps);
  const positionerElement = useStore(store, selectors.positionerElement);
  const listElement = useStore(store, selectors.listElement);
  const rootId = useStore(store, selectors.id);
  const selectLabelId = useStore(store, selectors.labelId);
  const hasSelectedValue = useStore(store, selectors.hasSelectedValue);
  const shouldCheckNullItemLabel = !hasSelectedValue && open;
  const hasNullItemLabel = useStore(store, selectors.hasNullItemLabel, shouldCheckNullItemLabel);
  const id = idProp ?? rootId;
  const ariaLabelledBy = resolveAriaLabelledBy(fieldLabelId, selectLabelId);
  useLabelableId({
    id
  });
  const positionerRef = useValueAsRef(positionerElement);
  const triggerRef = React.useRef(null);
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    native: nativeButton
  });
  const setTriggerElement = useStableCallback(element => {
    store.set('triggerElement', element);
  });
  const mergedRef = useMergedRefs(forwardedRef, triggerRef, buttonRef, setTriggerElement);
  const timeoutFocus = useTimeout();
  const timeoutMouseDown = useTimeout();
  const selectedDelayTimeout = useTimeout();
  const unselectedDelayTimeout = useTimeout();
  React.useEffect(() => {
    if (open) {
      const hasSelectedItemInList = hasSelectedValue || hasNullItemLabel;
      const shouldDelayUnselectedMouseUpLonger = !hasSelectedItemInList;

      // When there is no selected item in the list (placeholder-only selects), a mousedown
      // on the trigger followed by a quick mouseup over the first option can accidentally select
      // within 200ms. Delay unselected mouseup to match the safer 400ms window.
      if (shouldDelayUnselectedMouseUpLonger) {
        selectedDelayTimeout.start(SELECTED_DELAY, () => {
          selectionRef.current.allowUnselectedMouseUp = true;
          selectionRef.current.allowSelectedMouseUp = true;
        });
      } else {
        // mousedown -> move to unselected item -> mouseup should not select within 200ms.
        unselectedDelayTimeout.start(UNSELECTED_DELAY, () => {
          selectionRef.current.allowUnselectedMouseUp = true;

          // mousedown -> mouseup on selected item should not select within 400ms.
          selectedDelayTimeout.start(UNSELECTED_DELAY, () => {
            selectionRef.current.allowSelectedMouseUp = true;
          });
        });
      }
      return () => {
        selectedDelayTimeout.clear();
        unselectedDelayTimeout.clear();
      };
    }
    selectionRef.current = {
      allowSelectedMouseUp: false,
      allowUnselectedMouseUp: false
    };
    timeoutMouseDown.clear();
    return undefined;
  }, [open, hasSelectedValue, hasNullItemLabel, selectionRef, timeoutMouseDown, selectedDelayTimeout, unselectedDelayTimeout]);
  const ariaControlsId = React.useMemo(() => {
    return listElement?.id ?? getFloatingFocusElement(positionerElement)?.id;
  }, [listElement, positionerElement]);
  const props = mergeProps(triggerProps, {
    id,
    role: 'combobox',
    'aria-expanded': open ? 'true' : 'false',
    'aria-haspopup': 'listbox',
    'aria-controls': open ? ariaControlsId : undefined,
    'aria-labelledby': ariaLabelledBy,
    'aria-readonly': readOnly || undefined,
    'aria-required': required || undefined,
    tabIndex: disabled ? -1 : 0,
    ref: mergedRef,
    onFocus(event) {
      setFocused(true);

      // The popup element shouldn't obscure the focused trigger.
      if (open && alignItemWithTriggerActiveRef.current) {
        setOpen(false, createChangeEventDetails(REASONS.none, event.nativeEvent));
      }

      // Saves a re-render on initial click: `forceMount === true` mounts
      // the items before `open === true`. We could sync those cycles better
      // without a timeout, but this is enough for now.
      //
      // XXX: might be causing `act()` warnings.
      timeoutFocus.start(0, () => {
        store.set('forceMount', true);
      });
    },
    onBlur(event) {
      // If focus is moving into the popup, don't count it as a blur.
      if (contains(positionerElement, event.relatedTarget)) {
        return;
      }
      setTouched(true);
      setFocused(false);
      if (validationMode === 'onBlur') {
        validation.commit(value);
      }
    },
    onPointerMove() {
      keyboardActiveRef.current = false;
    },
    onKeyDown() {
      keyboardActiveRef.current = true;
    },
    onMouseDown(event) {
      if (open) {
        return;
      }
      const doc = ownerDocument(event.currentTarget);
      function handleMouseUp(mouseEvent) {
        if (!triggerRef.current) {
          return;
        }
        const mouseUpTarget = mouseEvent.target;

        // Early return if clicked on trigger element or its children
        if (contains(triggerRef.current, mouseUpTarget) || contains(positionerRef.current, mouseUpTarget) || mouseUpTarget === triggerRef.current) {
          return;
        }
        const bounds = getPseudoElementBounds(triggerRef.current);
        if (mouseEvent.clientX >= bounds.left - BOUNDARY_OFFSET && mouseEvent.clientX <= bounds.right + BOUNDARY_OFFSET && mouseEvent.clientY >= bounds.top - BOUNDARY_OFFSET && mouseEvent.clientY <= bounds.bottom + BOUNDARY_OFFSET) {
          return;
        }
        setOpen(false, createChangeEventDetails(REASONS.cancelOpen, mouseEvent));
      }

      // Firefox can fire this upon mousedown
      timeoutMouseDown.start(0, () => {
        doc.addEventListener('mouseup', handleMouseUp, {
          once: true
        });
      });
    }
  }, validation.getValidationProps, elementProps, getButtonProps);

  // ensure nested useButton does not overwrite the combobox role:
  // <Toolbar.Button render={<Select.Trigger />} />
  props.role = 'combobox';
  const state = {
    ...fieldState,
    open,
    disabled,
    value,
    readOnly,
    placeholder: !hasSelectedValue
  };
  return useRenderElement('button', componentProps, {
    ref: [forwardedRef, triggerRef],
    state,
    stateAttributesMapping,
    props
  });
});
if (process.env.NODE_ENV !== "production") SelectTrigger.displayName = "SelectTrigger";