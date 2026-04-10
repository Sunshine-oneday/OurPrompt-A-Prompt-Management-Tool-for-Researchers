import type { FloatingContext, FloatingRootContext } from "../types.js";
export type UseHoverFloatingInteractionProps = {
  /**
   * Whether the Hook is enabled, including all internal Effects and event
   * handlers.
   * @default true
   */
  enabled?: boolean | undefined;
  /**
   * Waits for the specified time when the event listener runs before changing
   * the `open` state.
   * @default 0
   */
  closeDelay?: number | (() => number) | undefined;
};
/**
 * Provides hover interactions that should be attached to the floating element.
 */
export declare function useHoverFloatingInteraction(context: FloatingRootContext | FloatingContext, parameters?: UseHoverFloatingInteractionProps): void;