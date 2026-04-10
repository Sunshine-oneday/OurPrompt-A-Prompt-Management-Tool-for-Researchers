import * as React from 'react';
import type { Delay, FloatingContext, FloatingRootContext } from "../types.js";
import type { FloatingTreeStore } from "../components/FloatingTreeStore.js";
import type { HandleClose, HandleCloseContextBase } from "./useHoverShared.js";
import { HTMLProps } from "../../utils/types.js";
export interface UseHoverReferenceInteractionProps {
  enabled?: boolean | undefined;
  handleClose?: HandleClose | null | undefined;
  restMs?: number | (() => number) | undefined;
  delay?: Delay | (() => Delay) | undefined;
  move?: boolean | undefined;
  mouseOnly?: boolean | undefined;
  externalTree?: FloatingTreeStore | undefined;
  /**
   * Whether the hook controls the active trigger. When false, the props are
   * returned under the `trigger` key so they can be applied to inactive
   * triggers via `getTriggerProps`.
   * @default true
   */
  isActiveTrigger?: boolean | undefined;
  triggerElementRef?: Readonly<React.RefObject<Element | null>> | undefined;
  getHandleCloseContext?: (() => HandleCloseContextBase | null) | undefined;
}
/**
 * Provides hover interactions that should be attached to reference or trigger
 * elements.
 */
export declare function useHoverReferenceInteraction(context: FloatingRootContext | FloatingContext, props?: UseHoverReferenceInteractionProps): HTMLProps | undefined;