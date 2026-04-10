"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToastRootDataAttributes = void 0;
let ToastRootDataAttributes = exports.ToastRootDataAttributes = /*#__PURE__*/function (ToastRootDataAttributes) {
  /**
   * Present when the toast is expanded in the viewport.
   * @type {boolean}
   */
  ToastRootDataAttributes["expanded"] = "data-expanded";
  /**
   * Present when the toast was removed due to exceeding the limit.
   * @type {boolean}
   */
  ToastRootDataAttributes["limited"] = "data-limited";
  /**
   * The type of the toast.
   * @type {string}
   */
  ToastRootDataAttributes["type"] = "data-type";
  /**
   * Present when the toast is being swiped.
   * @type {boolean}
   */
  ToastRootDataAttributes["swiping"] = "data-swiping";
  /**
   * The direction the toast was swiped.
   * @type {'up' | 'down' | 'left' | 'right'}
   */
  ToastRootDataAttributes["swipeDirection"] = "data-swipe-direction";
  /**
   * Present when the toast is animating in.
   */
  ToastRootDataAttributes["startingStyle"] = "data-starting-style";
  /**
   * Present when the toast is animating out.
   */
  ToastRootDataAttributes["endingStyle"] = "data-ending-style";
  return ToastRootDataAttributes;
}({});