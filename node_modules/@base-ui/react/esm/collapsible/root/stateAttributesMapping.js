import { collapsibleOpenStateMapping as baseMapping } from "../../utils/collapsibleOpenStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
export const collapsibleStateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping
};