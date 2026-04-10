import type { TransitionStatus } from "../../utils/useTransitionStatus.js";
export declare const stateAttributesMapping: {
  valid(value: boolean | null): Record<string, string> | null;
  transitionStatus(value: TransitionStatus): Record<string, string> | null;
  checked(value: boolean): Record<string, string>;
};