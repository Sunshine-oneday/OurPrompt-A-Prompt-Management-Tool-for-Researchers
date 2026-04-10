import { ProgressRootDataAttributes } from "./ProgressRootDataAttributes.js";
export const progressStateAttributesMapping = {
  status(value) {
    if (value === 'progressing') {
      return {
        [ProgressRootDataAttributes.progressing]: ''
      };
    }
    if (value === 'complete') {
      return {
        [ProgressRootDataAttributes.complete]: ''
      };
    }
    if (value === 'indeterminate') {
      return {
        [ProgressRootDataAttributes.indeterminate]: ''
      };
    }
    return null;
  }
};