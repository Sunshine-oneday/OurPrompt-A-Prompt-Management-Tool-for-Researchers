import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { fieldValidityMapping } from "../../field/utils/constants.js";
import { RadioRootDataAttributes } from "../root/RadioRootDataAttributes.js";
export const stateAttributesMapping = {
  checked(value) {
    if (value) {
      return {
        [RadioRootDataAttributes.checked]: ''
      };
    }
    return {
      [RadioRootDataAttributes.unchecked]: ''
    };
  },
  ...transitionStatusMapping,
  ...fieldValidityMapping
};