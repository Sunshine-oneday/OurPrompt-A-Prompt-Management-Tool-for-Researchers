import * as React from 'react';
import type { BaseUIComponentProps } from "../../utils/types.js";
import type { TransitionStatus } from "../../utils/useTransitionStatus.js";
/**
 * An overlay displayed beneath the popup.
 * Renders a `<div>` element.
 */
export declare const ComboboxBackdrop: React.ForwardRefExoticComponent<Omit<ComboboxBackdropProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxBackdropProps extends BaseUIComponentProps<'div', ComboboxBackdropState> {}
export interface ComboboxBackdropState {
  /**
   * Whether the popup is currently open.
   */
  open: boolean;
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus;
}
export declare namespace ComboboxBackdrop {
  type Props = ComboboxBackdropProps;
  type State = ComboboxBackdropState;
}