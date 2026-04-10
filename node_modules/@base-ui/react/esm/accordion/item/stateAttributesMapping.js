import { collapsibleOpenStateMapping as baseMapping } from "../../utils/collapsibleOpenStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { AccordionItemDataAttributes } from "./AccordionItemDataAttributes.js";
export const accordionStateAttributesMapping = {
  ...baseMapping,
  index: value => {
    return Number.isInteger(value) ? {
      [AccordionItemDataAttributes.index]: String(value)
    } : null;
  },
  ...transitionStatusMapping,
  value: () => null
};