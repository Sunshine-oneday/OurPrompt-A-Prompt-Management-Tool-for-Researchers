import type { StateAttributesMapping } from "./getStateAttributesProps.js";
export declare const triggerOpenStateMapping: StateAttributesMapping<{
  open: boolean;
}>;
export declare const collapsibleOpenStateMapping: {
  open(value: boolean): {
    "data-open": string;
  } | {
    "data-closed": string;
  };
};