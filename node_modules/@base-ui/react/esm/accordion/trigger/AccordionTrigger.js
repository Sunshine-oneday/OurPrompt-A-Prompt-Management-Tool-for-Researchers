'use client';

import * as React from 'react';
import { isElementDisabled } from '@base-ui/utils/isElementDisabled';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { triggerOpenStateMapping } from "../../utils/collapsibleOpenStateMapping.js";
import { useButton } from "../../use-button/index.js";
import { useCollapsibleRootContext } from "../../collapsible/root/CollapsibleRootContext.js";
import { ARROW_DOWN, ARROW_UP, ARROW_RIGHT, ARROW_LEFT, HOME, END, stopEvent } from "../../composite/composite.js";
import { useAccordionRootContext } from "../root/AccordionRootContext.js";
import { useAccordionItemContext } from "../item/AccordionItemContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
const SUPPORTED_KEYS = new Set([ARROW_DOWN, ARROW_UP, ARROW_RIGHT, ARROW_LEFT, HOME, END]);
function getActiveTriggers(accordionItemRefs) {
  const {
    current: accordionItemElements
  } = accordionItemRefs;
  const output = [];
  for (let i = 0; i < accordionItemElements.length; i += 1) {
    const section = accordionItemElements[i];
    if (!isElementDisabled(section)) {
      const trigger = section?.querySelector('[type="button"], [role="button"]');
      if (trigger && !isElementDisabled(trigger)) {
        output.push(trigger);
      }
    }
  }
  return output;
}

/**
 * A button that opens and closes the corresponding panel.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Accordion](https://base-ui.com/react/components/accordion)
 */

export const AccordionTrigger = /*#__PURE__*/React.forwardRef(function AccordionTrigger(componentProps, forwardedRef) {
  const {
    disabled: disabledProp,
    className,
    id: idProp,
    render,
    nativeButton = true,
    ...elementProps
  } = componentProps;
  const {
    panelId,
    open,
    handleTrigger,
    disabled: contextDisabled
  } = useCollapsibleRootContext();
  const disabled = disabledProp ?? contextDisabled;
  const {
    getButtonProps,
    buttonRef
  } = useButton({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
    composite: true
  });
  const {
    accordionItemRefs,
    direction,
    loopFocus,
    orientation
  } = useAccordionRootContext();
  const isRtl = direction === 'rtl';
  const isHorizontal = orientation === 'horizontal';
  const {
    state,
    setTriggerId,
    triggerId: id
  } = useAccordionItemContext();
  useIsoLayoutEffect(() => {
    if (idProp) {
      setTriggerId(idProp);
    }
    return () => {
      setTriggerId(undefined);
    };
  }, [idProp, setTriggerId]);
  const props = React.useMemo(() => ({
    'aria-controls': open ? panelId : undefined,
    'aria-expanded': open,
    id,
    tabIndex: 0,
    onClick: handleTrigger,
    onKeyDown(event) {
      if (!SUPPORTED_KEYS.has(event.key)) {
        return;
      }
      stopEvent(event);
      const triggers = getActiveTriggers(accordionItemRefs);
      const numOfEnabledTriggers = triggers.length;
      const lastIndex = numOfEnabledTriggers - 1;
      let nextIndex = -1;
      const thisIndex = triggers.indexOf(event.target);
      function toNext() {
        if (loopFocus) {
          nextIndex = thisIndex + 1 > lastIndex ? 0 : thisIndex + 1;
        } else {
          nextIndex = Math.min(thisIndex + 1, lastIndex);
        }
      }
      function toPrev() {
        if (loopFocus) {
          nextIndex = thisIndex === 0 ? lastIndex : thisIndex - 1;
        } else {
          nextIndex = thisIndex - 1;
        }
      }
      switch (event.key) {
        case ARROW_DOWN:
          if (!isHorizontal) {
            toNext();
          }
          break;
        case ARROW_UP:
          if (!isHorizontal) {
            toPrev();
          }
          break;
        case ARROW_RIGHT:
          if (isHorizontal) {
            if (isRtl) {
              toPrev();
            } else {
              toNext();
            }
          }
          break;
        case ARROW_LEFT:
          if (isHorizontal) {
            if (isRtl) {
              toNext();
            } else {
              toPrev();
            }
          }
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = lastIndex;
          break;
        default:
          break;
      }
      if (nextIndex > -1) {
        triggers[nextIndex].focus();
      }
    }
  }), [accordionItemRefs, handleTrigger, id, isHorizontal, isRtl, loopFocus, open, panelId]);
  const element = useRenderElement('button', componentProps, {
    state,
    ref: [forwardedRef, buttonRef],
    props: [props, elementProps, getButtonProps],
    stateAttributesMapping: triggerOpenStateMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") AccordionTrigger.displayName = "AccordionTrigger";