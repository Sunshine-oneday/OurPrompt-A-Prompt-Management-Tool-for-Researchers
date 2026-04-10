import { Dimensions } from "../floating-ui-react/types.js";
import { Side } from "./useAnchorPositioning.js";
/**
 * Allows the element to automatically resize based on its content while supporting animations.
 */
export declare function usePopupAutoResize(parameters: UsePopupAutoResizeParameters): void;
interface UsePopupAutoResizeParameters {
  /**
   * Element to resize.
   */
  popupElement: HTMLElement | null;
  positionerElement: HTMLElement | null;
  /**
   * Whether the popup is mounted.
   */
  mounted: boolean;
  content: unknown;
  /**
   * Whether the auto-resize is enabled. This function runs in an effect and can safely access refs.
   */
  enabled?: (() => boolean) | undefined;
  /**
   * Callback fired immediately before measuring the dimensions of the new content.
   */
  onMeasureLayout?: (() => void) | undefined;
  /**
   * Callback fired after the new dimensions have been measured.
   *
   * @param previousDimensions Dimensions before the change, or `null` if this is the first measurement.
   * @param newDimensions Newly measured dimensions.
   */
  onMeasureLayoutComplete?: ((previousDimensions: Dimensions | null, newDimensions: Dimensions) => void) | undefined;
  side: Side;
  direction: 'ltr' | 'rtl';
}
export {};