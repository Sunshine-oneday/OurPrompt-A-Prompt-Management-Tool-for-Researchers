"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuTriggerDataAttributes = void 0;
let MenuTriggerDataAttributes = exports.MenuTriggerDataAttributes = /*#__PURE__*/function (MenuTriggerDataAttributes) {
  /**
   * Present when the corresponding menubar is modal.
   */
  MenuTriggerDataAttributes["modal"] = "data-modal";
  /**
   * Determines the orientation of the menubar.
   * @type 'horizontal' | 'vertical'
   * @default 'horizontal'
   */
  MenuTriggerDataAttributes["orientation"] = "data-orientation";
  return MenuTriggerDataAttributes;
}({});