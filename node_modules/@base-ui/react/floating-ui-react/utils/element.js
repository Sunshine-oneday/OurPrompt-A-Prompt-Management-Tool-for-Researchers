"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activeElement = activeElement;
exports.contains = contains;
exports.getFloatingFocusElement = getFloatingFocusElement;
exports.getTarget = getTarget;
exports.isEventTargetWithin = isEventTargetWithin;
exports.isRootElement = isRootElement;
exports.isTargetInsideEnabledTrigger = isTargetInsideEnabledTrigger;
exports.isTypeableCombobox = isTypeableCombobox;
exports.isTypeableElement = isTypeableElement;
exports.matchesFocusVisible = matchesFocusVisible;
var _dom = require("@floating-ui/utils/dom");
var _detectBrowser = require("@base-ui/utils/detectBrowser");
var _constants = require("./constants");
function activeElement(doc) {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement != null) {
    element = element.shadowRoot.activeElement;
  }
  return element;
}
function contains(parent, child) {
  if (!parent || !child) {
    return false;
  }
  const rootNode = child.getRootNode?.();

  // First, attempt with faster native method
  if (parent.contains(child)) {
    return true;
  }

  // then fallback to custom implementation with Shadow DOM support
  if (rootNode && (0, _dom.isShadowRoot)(rootNode)) {
    let next = child;
    while (next) {
      if (parent === next) {
        return true;
      }
      next = next.parentNode || next.host;
    }
  }

  // Give up, the result is false
  return false;
}
function isTargetInsideEnabledTrigger(target, triggerElements) {
  if (!(0, _dom.isElement)(target)) {
    return false;
  }
  const targetElement = target;
  if (triggerElements.hasElement(targetElement)) {
    return !targetElement.hasAttribute('data-trigger-disabled');
  }
  for (const [, trigger] of triggerElements.entries()) {
    if (contains(trigger, targetElement)) {
      return !trigger.hasAttribute('data-trigger-disabled');
    }
  }
  return false;
}
function getTarget(event) {
  if ('composedPath' in event) {
    return event.composedPath()[0];
  }

  // TS thinks `event` is of type never as it assumes all browsers support
  // `composedPath()`, but browsers without shadow DOM don't.
  return event.target;
}
function isEventTargetWithin(event, node) {
  if (node == null) {
    return false;
  }
  if ('composedPath' in event) {
    return event.composedPath().includes(node);
  }

  // TS thinks `event` is of type never as it assumes all browsers support composedPath, but browsers without shadow dom don't
  const eventAgain = event;
  return eventAgain.target != null && node.contains(eventAgain.target);
}
function isRootElement(element) {
  return element.matches('html,body');
}
function isTypeableElement(element) {
  return (0, _dom.isHTMLElement)(element) && element.matches(_constants.TYPEABLE_SELECTOR);
}
function isTypeableCombobox(element) {
  if (!element) {
    return false;
  }
  return element.getAttribute('role') === 'combobox' && isTypeableElement(element);
}
function matchesFocusVisible(element) {
  // We don't want to block focus from working with `visibleOnly`
  // (JSDOM doesn't match `:focus-visible` when the element has `:focus`)
  if (!element || _detectBrowser.isJSDOM) {
    return true;
  }
  try {
    return element.matches(':focus-visible');
  } catch (_e) {
    return true;
  }
}
function getFloatingFocusElement(floatingElement) {
  if (!floatingElement) {
    return null;
  }
  // Try to find the element that has `{...getFloatingProps()}` spread on it.
  // This indicates the floating element is acting as a positioning wrapper, and
  // so focus should be managed on the child element with the event handlers and
  // aria props.
  return floatingElement.hasAttribute(_constants.FOCUSABLE_ATTRIBUTE) ? floatingElement : floatingElement.querySelector(`[${_constants.FOCUSABLE_ATTRIBUTE}]`) || floatingElement;
}