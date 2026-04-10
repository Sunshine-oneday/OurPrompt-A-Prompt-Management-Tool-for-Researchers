"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useInteractions = useInteractions;
var React = _interopRequireWildcard(require("react"));
var _constants = require("../utils/constants");
/**
 * Merges an array of interaction hooks' props into prop getters, allowing
 * event handler functions to be composed together without overwriting one
 * another.
 * @see https://floating-ui.com/docs/useInteractions
 */
function useInteractions(propsList = []) {
  const referenceDeps = propsList.map(key => key?.reference);
  const floatingDeps = propsList.map(key => key?.floating);
  const itemDeps = propsList.map(key => key?.item);
  const triggerDeps = propsList.map(key => key?.trigger);
  const getReferenceProps = React.useCallback(userProps => mergeProps(userProps, propsList, 'reference'),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  referenceDeps);
  const getFloatingProps = React.useCallback(userProps => mergeProps(userProps, propsList, 'floating'),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  floatingDeps);
  const getItemProps = React.useCallback(userProps => mergeProps(userProps, propsList, 'item'),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  itemDeps);
  const getTriggerProps = React.useCallback(userProps => mergeProps(userProps, propsList, 'trigger'),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  triggerDeps);
  return React.useMemo(() => ({
    getReferenceProps,
    getFloatingProps,
    getItemProps,
    getTriggerProps
  }), [getReferenceProps, getFloatingProps, getItemProps, getTriggerProps]);
}

/* eslint-disable guard-for-in */

function mergeProps(userProps, propsList, elementKey) {
  const eventHandlers = new Map();
  const isItem = elementKey === 'item';
  const outputProps = {};
  if (elementKey === 'floating') {
    outputProps.tabIndex = -1;
    outputProps[_constants.FOCUSABLE_ATTRIBUTE] = '';
  }
  for (const key in userProps) {
    if (isItem && userProps) {
      if (key === _constants.ACTIVE_KEY || key === _constants.SELECTED_KEY) {
        continue;
      }
    }
    outputProps[key] = userProps[key];
  }
  for (let i = 0; i < propsList.length; i += 1) {
    let props;
    const propsOrGetProps = propsList[i]?.[elementKey];
    if (typeof propsOrGetProps === 'function') {
      props = userProps ? propsOrGetProps(userProps) : null;
    } else {
      props = propsOrGetProps;
    }
    if (!props) {
      continue;
    }
    mutablyMergeProps(outputProps, props, isItem, eventHandlers);
  }
  mutablyMergeProps(outputProps, userProps, isItem, eventHandlers);
  return outputProps;
}
function mutablyMergeProps(outputProps, props, isItem, eventHandlers) {
  for (const key in props) {
    const value = props[key];
    if (isItem && (key === _constants.ACTIVE_KEY || key === _constants.SELECTED_KEY)) {
      continue;
    }
    if (!key.startsWith('on')) {
      outputProps[key] = value;
    } else {
      if (!eventHandlers.has(key)) {
        eventHandlers.set(key, []);
      }
      if (typeof value === 'function') {
        eventHandlers.get(key)?.push(value);
        outputProps[key] = (...args) => {
          return eventHandlers.get(key)?.map(fn => fn(...args)).find(val => val !== undefined);
        };
      }
    }
  }
}