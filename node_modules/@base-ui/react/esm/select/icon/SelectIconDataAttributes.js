import { CommonTriggerDataAttributes } from "../../utils/popupStateMapping.js";
export let SelectIconDataAttributes = function (SelectIconDataAttributes) {
  /**
   * Present when the corresponding popup is open.
   */
  SelectIconDataAttributes[SelectIconDataAttributes["popupOpen"] = CommonTriggerDataAttributes.popupOpen] = "popupOpen";
  return SelectIconDataAttributes;
}({});