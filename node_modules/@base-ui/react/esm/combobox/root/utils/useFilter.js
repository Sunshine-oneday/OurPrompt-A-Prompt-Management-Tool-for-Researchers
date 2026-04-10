'use client';

import * as React from 'react';
import { createCollatorItemFilter, createSingleSelectionCollatorFilter } from "./index.js";
import { stringifyAsLabel } from "../../../utils/resolveValueLabel.js";
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
      const itemString = stringifyAsLabel(item, itemToString);
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
      const itemString = stringifyAsLabel(item, itemToString);
      return collator.compare(itemString.slice(0, query.length), query) === 0;
    },
    endsWith(item, query, itemToString) {
      if (!query) {
        return true;
      }
      const itemString = stringifyAsLabel(item, itemToString);
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
export const useCoreFilter = getFilter;
/**
 * Matches items against a query using `Intl.Collator` for robust string matching.
 */
export function useComboboxFilter(options = {}) {
  const {
    multiple = false,
    value,
    ...collatorOptions
  } = options;
  const coreFilter = getFilter(collatorOptions);
  const contains = React.useCallback((item, query, itemToString) => {
    if (multiple) {
      return createCollatorItemFilter(coreFilter, itemToString)(item, query);
    }
    return createSingleSelectionCollatorFilter(coreFilter, itemToString, value)(item, query);
  }, [coreFilter, value, multiple]);
  return React.useMemo(() => ({
    contains,
    startsWith: coreFilter.startsWith,
    endsWith: coreFilter.endsWith
  }), [contains, coreFilter]);
}