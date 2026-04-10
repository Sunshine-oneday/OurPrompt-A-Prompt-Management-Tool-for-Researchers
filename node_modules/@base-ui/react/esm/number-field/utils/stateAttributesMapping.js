import { fieldValidityMapping } from "../../field/utils/constants.js";
export const stateAttributesMapping = {
  inputValue: () => null,
  value: () => null,
  ...fieldValidityMapping
};