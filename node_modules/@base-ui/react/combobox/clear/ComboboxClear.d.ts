import * as React from 'react';
import type { BaseUIComponentProps, NativeButtonProps } from "../../utils/types.js";
import { TransitionStatus } from "../../utils/useTransitionStatus.js";
/**
 * Clears the value when clicked.
 * Renders a `<button>` element.
 */
export declare const ComboboxClear: React.ForwardRefExoticComponent<Omit<ComboboxClearProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export interface ComboboxClearState {
  /**
   * Whether the popup is open.
   */
  open: boolean;
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean;
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus;
}
export interface ComboboxClearProps extends NativeButtonProps, BaseUIComponentProps<'button', ComboboxClearState> {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Whether the component should remain mounted in the DOM when not visible.
   * @default false
   */
  keepMounted?: boolean | undefined;
}
export declare namespace ComboboxClear {
  type State = ComboboxClearState;
  type Props = ComboboxClearProps;
}