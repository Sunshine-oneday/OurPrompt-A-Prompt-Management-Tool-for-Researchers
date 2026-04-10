import type { Side } from "../../utils/useAnchorPositioning.js";
export declare const triggerStateAttributesMapping: {
  popupSide: (side: Side | null) => {
    'data-popup-side': Side;
  } | null;
  listEmpty: (empty: boolean) => {
    'data-list-empty': string;
  } | null;
  valid(value: boolean | null): Record<string, string> | null;
  open(value: boolean): {
    "data-popup-open": string;
    "data-pressed": string;
  } | null;
};