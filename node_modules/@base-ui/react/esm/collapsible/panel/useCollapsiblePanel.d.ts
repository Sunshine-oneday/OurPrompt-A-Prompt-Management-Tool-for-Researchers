import * as React from 'react';
import { HTMLProps } from "../../utils/types.js";
import type { AnimationType, Dimensions } from "../root/useCollapsibleRoot.js";
import type { CollapsibleRoot } from "../root/CollapsibleRoot.js";
export declare function useCollapsiblePanel(parameters: UseCollapsiblePanelParameters): UseCollapsiblePanelReturnValue;
export interface UseCollapsiblePanelParameters {
  abortControllerRef: React.RefObject<AbortController | null>;
  animationTypeRef: React.RefObject<AnimationType>;
  externalRef: React.ForwardedRef<HTMLDivElement>;
  /**
   * The height of the panel.
   */
  height: number | undefined;
  /**
   * Allows the browser’s built-in page search to find and expand the panel contents.
   *
   * Overrides the `keepMounted` prop and uses `hidden="until-found"`
   * to hide the element without removing it from the DOM.
   */
  hiddenUntilFound: boolean;
  /**
   * The `id` attribute of the panel.
   */
  id: React.HTMLAttributes<Element>['id'];
  /**
   * Whether to keep the element in the DOM while the panel is closed.
   * This prop is ignored when `hiddenUntilFound` is used.
   */
  keepMounted: boolean;
  /**
   * Whether the collapsible panel is currently mounted.
   */
  mounted: boolean;
  onOpenChange: (open: boolean, eventDetails: CollapsibleRoot.ChangeEventDetails) => void;
  /**
   * Whether the collapsible panel is currently open.
   */
  open: boolean;
  panelRef: React.RefObject<HTMLElement | null>;
  runOnceAnimationsFinish: (fnToExecute: () => void, signal?: AbortSignal | null) => void;
  setDimensions: React.Dispatch<React.SetStateAction<Dimensions>>;
  setMounted: (nextMounted: boolean) => void;
  setOpen: (nextOpen: boolean) => void;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  transitionDimensionRef: React.RefObject<'height' | 'width' | null>;
  /**
   * The visible state of the panel used to determine the `[hidden]` attribute
   * only when CSS keyframe animations are used.
   */
  visible: boolean;
  /**
   * The width of the panel.
   */
  width: number | undefined;
}
export interface UseCollapsiblePanelReturnValue {
  props: HTMLProps;
}
export interface UseCollapsiblePanelState {}