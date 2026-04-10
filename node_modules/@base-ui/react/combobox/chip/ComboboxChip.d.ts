import * as React from 'react';
import { BaseUIComponentProps } from "../../utils/types.js";
/**
 * An individual chip that represents a value in a multiselectable input.
 * Renders a `<div>` element.
 */
export declare const ComboboxChip: React.ForwardRefExoticComponent<Omit<ComboboxChipProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxChipState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean;
}
export interface ComboboxChipProps extends BaseUIComponentProps<'div', ComboboxChipState> {}
export declare namespace ComboboxChip {
  type State = ComboboxChipState;
  type Props = ComboboxChipProps;
}