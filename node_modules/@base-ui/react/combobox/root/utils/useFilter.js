"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useComboboxFilter = useComboboxFilter;
exports.useCoreFilter = void 0;
var React = _interopRequireWildcard(require("react"));
var _index = require("./index");
var _resolveValueLabel = require("../../../utils/resolveValueLabel");
const filterCache = new Map();
function stringifyLocale(locale) {
  if (Array.isArray(locale)) {
    return locale.map(value => stringifyLocale(value)).join(',');
  }
  if (locale == null) {
    return '';
  }
  return String(locale);
}
function getFilter(options = {}) {
  const mergedOptions = {
    usage: 'search',
    sensitivity: 'base',
    ignorePunctuation: true,
    ...options
  };
  const cacheKey = `${stringifyLocale(options.locale)}|${JSON.stringify(mergedOptions)}`;
  const cachedFilter = filterCache.get(cacheKey);
  if (cachedFilter) {
    return cachedFilter;
  }
  const collator = new Intl.Collator(options.locale, mergedOptions);
  const filter = {
    contains(item, query, itemToString) {
      if (!query) {
        return true;
      }
      const itemString = (0, _resolveValueLabel.stringifyAsLabel)(item, itemToString);
      for (let i = 0; i <= itemString.length - query.length; i += 1) {
        if (collator.compare(itemString.slice(i, i + query.length), query) === 0) {
          return true;
        }
      }
      return false;
    },
    startsWith(item, query, itemToString) {
      if (!query) {
        return true;
      }
      const itemString = (0, _resolveValueLabel.stringifyAsLabel)(item, itemToString);
      return collator.compare(itemString.slice(0, query.length), query) === 0;
    },
    endsWith(item, query, itemToString) {
      if (!query) {
        return true;
      }
      const itemString = (0, _resolveValueLabel.stringifyAsLabel)(item, itemToString);
      const queryLength = query.length;
      return itemString.length >= queryLength && collator.compare(itemString.slice(itemString.length - queryLength), query) === 0;
    }
  };
  filterCache.set(cacheKey, filter);
  return filter;
}

/**
 * Matches items against a query using `Intl.Collator` for robust string matching.
 */
const useCoreFilter = exports.useCoreFilter = getFilter;
/**
 * Matches items against a query using `Intl.Collator` for robust string matching.
 */
function useComboboxFilter(options = {}) {
  const {
    multiple = false,
    value,
    ...collatorOptions
  } = options;
  const coreFilter = getFilter(collatorOptions);
  const contains = React.useCallback((item, query, itemToString) => {
    if (multiple) {
      return (0, _index.createCollatorItemFilter)(coreFilter, itemToString)(item, query);
    }
    return (0, _index.createSingleSelectionCollatorFilter)(coreFilter, itemToString, value)(item, query);
  }, [coreFilter, value, multiple]);
  return React.useMemo(() => ({
    contains,
    startsWith: coreFilter.startsWith,
    endsWith: coreFilter.endsWith
  }), [contains, coreFilter]);
}