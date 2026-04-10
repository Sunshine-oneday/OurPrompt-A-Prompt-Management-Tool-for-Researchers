import * as React from 'react';
import { BaseUIComponentProps } from "../../utils/types.js";
/**
 * A container for the chips in a multiselectable input.
 * Renders a `<div>` element.
 */
export declare const ComboboxChips: React.ForwardRefExoticComponent<Omit<ComboboxChipsProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxChipsState {}
export interface ComboboxChipsProps extends BaseUIComponentProps<'div', ComboboxChipsState> {}
export declare namespace ComboboxChips {
  type State = ComboboxChipsState;
  type Props = ComboboxChipsProps;
}