import { CommonPopupDataAttributes, CommonTriggerDataAttributes } from "../../utils/popupStateMapping.js";
export let ComboboxClearDataAttributes = function (ComboboxClearDataAttributes) {
  /**
   * Present when the corresponding popup is open.
   */
  ComboboxClearDataAttributes[ComboboxClearDataAttributes["popupOpen"] = CommonTriggerDataAttributes.popupOpen] = "popupOpen";
  /**
   * Present when the button is disabled.
   */
  ComboboxClearDataAttributes["disabled"] = "data-disabled";
  /**
   * Present when the button is animating in.
   */
  ComboboxClearDataAttributes[ComboboxClearDataAttributes["startingStyle"] = CommonPopupDataAttributes.startingStyle] = "startingStyle";
  /**
   * Present when the button is animating out.
   */
  ComboboxClearDataAttributes[ComboboxClearDataAttributes["endingStyle"] = CommonPopupDataAttributes.endingStyle] = "endingStyle";
  return ComboboxClearDataAttributes;
}({});