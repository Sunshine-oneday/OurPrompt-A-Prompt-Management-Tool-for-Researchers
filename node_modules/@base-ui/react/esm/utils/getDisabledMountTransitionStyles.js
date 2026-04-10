import { DISABLED_TRANSITIONS_STYLE, EMPTY_OBJECT } from "./constants.js";
export function getDisabledMountTransitionStyles(transitionStatus) {
  return transitionStatus === 'starting' ? DISABLED_TRANSITIONS_STYLE : EMPTY_OBJECT;
}