import * as React from 'react';
import { BaseUIComponentProps } from "../../utils/types.js";
/**
 * Displays a single row of items in a grid list.
 * Enable `grid` on the root component to turn the listbox into a grid.
 * Renders a `<div>` element.
 */
export declare const ComboboxRow: React.ForwardRefExoticComponent<Omit<ComboboxRowProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxRowState {}
export interface ComboboxRowProps extends BaseUIComponentProps<'div', ComboboxRowState> {}
export declare namespace ComboboxRow {
  type State = ComboboxRowState;
  type Props = ComboboxRowProps;
}