import { fieldValidityMapping } from "../../field/utils/constants.js";
export const sliderStateAttributesMapping = {
  activeThumbIndex: () => null,
  max: () => null,
  min: () => null,
  minStepsBetweenValues: () => null,
  step: () => null,
  values: () => null,
  ...fieldValidityMapping
};