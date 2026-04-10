import * as React from 'react';
import { BaseUIComponentProps } from "../../utils/types.js";
/**
 * An accessible label that is automatically associated with its parent group.
 * Renders a `<div>` element.
 */
export declare const ComboboxGroupLabel: React.ForwardRefExoticComponent<Omit<ComboboxGroupLabelProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxGroupLabelState {}
export interface ComboboxGroupLabelProps extends BaseUIComponentProps<'div', ComboboxGroupLabelState> {}
export declare namespace ComboboxGroupLabel {
  type State = ComboboxGroupLabelState;
  type Props = ComboboxGroupLabelProps;
}