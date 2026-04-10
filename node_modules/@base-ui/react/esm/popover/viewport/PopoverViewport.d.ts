import * as React from 'react';
import { BaseUIComponentProps } from "../../utils/types.js";
/**
 * A viewport for displaying content transitions.
 * This component is only required if one popup can be opened by multiple triggers, its content change based on the trigger
 * and switching between them is animated.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Popover](https://base-ui.com/react/components/popover)
 */
export declare const PopoverViewport: React.ForwardRefExoticComponent<Omit<PopoverViewport.Props, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface PopoverViewportState {
  /**
   * The activation direction of the transitioned content.
   */
  activationDirection: string | undefined;
  /**
   * Whether the viewport is currently transitioning between contents.
   */
  transitioning: boolean;
  /**
   * Present if animations should be instant.
   */
  instant: 'dismiss' | 'click' | undefined;
}
export declare namespace PopoverViewport {
  interface Props extends BaseUIComponentProps<'div', PopoverViewportState> {
    /**
     * The content to render inside the transition container.
     */
    children?: React.ReactNode;
  }
  type State = PopoverViewportState;
}