import * as React from 'react';
import { BaseUIComponentProps } from "../../utils/types.js";
/**
 * Renders its children only when the list is empty.
 * Requires the `items` prop on the root component.
 * Announces changes politely to screen readers.
 * Renders a `<div>` element.
 */
export declare const ComboboxEmpty: React.ForwardRefExoticComponent<Omit<ComboboxEmptyProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxEmptyState {}
export interface ComboboxEmptyProps extends BaseUIComponentProps<'div', ComboboxEmptyState> {}
export declare namespace ComboboxEmpty {
  type State = ComboboxEmptyState;
  type Props = ComboboxEmptyProps;
}