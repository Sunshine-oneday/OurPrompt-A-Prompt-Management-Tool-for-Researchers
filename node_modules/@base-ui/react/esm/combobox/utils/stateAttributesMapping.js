import { pressableTriggerOpenStateMapping } from "../../utils/popupStateMapping.js";
import { fieldValidityMapping } from "../../field/utils/constants.js";
export const triggerStateAttributesMapping = {
  ...pressableTriggerOpenStateMapping,
  ...fieldValidityMapping,
  popupSide: side => side ? {
    'data-popup-side': side
  } : null,
  listEmpty: empty => empty ? {
    'data-list-empty': ''
  } : null
};