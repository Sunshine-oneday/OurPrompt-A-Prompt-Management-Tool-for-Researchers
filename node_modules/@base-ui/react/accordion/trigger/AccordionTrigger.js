"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AccordionTrigger = void 0;
var React = _interopRequireWildcard(require("react"));
var _isElementDisabled = require("@base-ui/utils/isElementDisabled");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _collapsibleOpenStateMapping = require("../../utils/collapsibleOpenStateMapping");
var _useButton = require("../../use-button");
var _CollapsibleRootContext = require("../../collapsible/root/CollapsibleRootContext");
var _composite = require("../../composite/composite");
var _AccordionRootContext = require("../root/AccordionRootContext");
var _AccordionItemContext = require("../item/AccordionItemContext");
var _useRenderElement = require("../../utils/useRenderElement");
const SUPPORTED_KEYS = new Set([_composite.ARROW_DOWN, _composite.ARROW_UP, _composite.ARROW_RIGHT, _composite.ARROW_LEFT, _composite.HOME, _composite.END]);
function getActiveTriggers(accordionItemRefs) {
  const {
    current: accordionItemElements
  } = accordionItemRefs;
  const output = [];
  for (let i = 0; i < accordionItemElements.length; i += 1) {
    const section = accordionItemElements[i];
    if (!(0, _isElementDisabled.isElementDisabled)(section)) {
      const trigger = section?.querySelector('[type="button"], [role="button"]');
      if (trigger && !(0, _isElementDisabled.isElementDisabled)(trigger)) {
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

const AccordionTrigger = exports.AccordionTrigger = /*#__PURE__*/React.forwardRef(function AccordionTrigger(componentProps, forwardedRef) {
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
  } = (0, _CollapsibleRootContext.useCollapsibleRootContext)();
  const disabled = disabledProp ?? contextDisabled;
  const {
    getButtonProps,
    buttonRef
  } = (0, _useButton.useButton)({
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
  } = (0, _AccordionRootContext.useAccordionRootContext)();
  const isRtl = direction === 'rtl';
  const isHorizontal = orientation === 'horizontal';
  const {
    state,
    setTriggerId,
    triggerId: id
  } = (0, _AccordionItemContext.useAccordionItemContext)();
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
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
      (0, _composite.stopEvent)(event);
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
        case _composite.ARROW_DOWN:
          if (!isHorizontal) {
            toNext();
          }
          break;
        case _composite.ARROW_UP:
          if (!isHorizontal) {
            toPrev();
          }
          break;
        case _composite.ARROW_RIGHT:
          if (isHorizontal) {
            if (isRtl) {
              toPrev();
            } else {
              toNext();
            }
          }
          break;
        case _composite.ARROW_LEFT:
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
  const element = (0, _useRenderElement.useRenderElement)('button', componentProps, {
    state,
    ref: [forwardedRef, buttonRef],
    props: [props, elementProps, getButtonProps],
    stateAttributesMapping: _collapsibleOpenStateMapping.triggerOpenStateMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") AccordionTrigger.displayName = "AccordionTrigger";