import { fieldValidityMapping } from "../field/utils/constants.js";
import { SwitchRootDataAttributes } from "./root/SwitchRootDataAttributes.js";
export const stateAttributesMapping = {
  ...fieldValidityMapping,
  checked(value) {
    if (value) {
      return {
        [SwitchRootDataAttributes.checked]: ''
      };
    }
    return {
      [SwitchRootDataAttributes.unchecked]: ''
    };
  }
};