import { CommonTriggerDataAttributes } from "../../utils/popupStateMapping.js";
export let MenuSubmenuTriggerDataAttributes = function (MenuSubmenuTriggerDataAttributes) {
  /**
   * Present when the corresponding submenu is open.
   */
  MenuSubmenuTriggerDataAttributes[MenuSubmenuTriggerDataAttributes["popupOpen"] = CommonTriggerDataAttributes.popupOpen] = "popupOpen";
  /**
   * Present when the submenu trigger is highlighted.
   */
  MenuSubmenuTriggerDataAttributes["highlighted"] = "data-highlighted";
  /**
   * Present when the submenu trigger is disabled.
   */
  MenuSubmenuTriggerDataAttributes["disabled"] = "data-disabled";
  return MenuSubmenuTriggerDataAttributes;
}({});