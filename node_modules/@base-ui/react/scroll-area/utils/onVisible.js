"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onVisible = onVisible;
/**
 * Executes a callback when an element becomes visible.
 */
function onVisible(element, callback) {
  if (typeof IntersectionObserver === 'undefined') {
    return () => {};
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.intersectionRatio > 0) {
        callback();
        observer.disconnect();
      }
    });
  });
  observer.observe(element);
  return () => {
    observer.disconnect();
  };
}