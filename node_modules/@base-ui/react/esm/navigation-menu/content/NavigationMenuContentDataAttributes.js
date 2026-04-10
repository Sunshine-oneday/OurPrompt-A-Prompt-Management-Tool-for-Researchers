import { CommonPopupDataAttributes } from "../../utils/popupStateMapping.js";
export let NavigationMenuContentDataAttributes = function (NavigationMenuContentDataAttributes) {
  /**
   * Present when the popup is open.
   */
  NavigationMenuContentDataAttributes[NavigationMenuContentDataAttributes["open"] = CommonPopupDataAttributes.open] = "open";
  /**
   * Present when the popup is closed.
   */
  NavigationMenuContentDataAttributes[NavigationMenuContentDataAttributes["closed"] = CommonPopupDataAttributes.closed] = "closed";
  /**
   * Present when the content is animating in.
   */
  NavigationMenuContentDataAttributes[NavigationMenuContentDataAttributes["startingStyle"] = CommonPopupDataAttributes.startingStyle] = "startingStyle";
  /**
   * Present when the content is animating out.
   */
  NavigationMenuContentDataAttributes[NavigationMenuContentDataAttributes["endingStyle"] = CommonPopupDataAttributes.endingStyle] = "endingStyle";
  /**
   * Which direction another trigger was activated from.
   */
  NavigationMenuContentDataAttributes["activationDirection"] = "data-activation-direction";
  return NavigationMenuContentDataAttributes;
}({});