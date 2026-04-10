import * as React from 'react';
import { BaseUIComponentProps } from "../../utils/types.js";
/**
 * Groups related items with the corresponding label.
 * Renders a `<div>` element.
 */
export declare const ComboboxGroup: React.ForwardRefExoticComponent<Omit<ComboboxGroupProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxGroupState {}
export interface ComboboxGroupProps extends BaseUIComponentProps<'div', ComboboxGroupState> {
  /**
   * Items to be rendered within this group.
   * When provided, child `Collection` components will use these items.
   */
  items?: readonly any[] | undefined;
}
export declare namespace ComboboxGroup {
  type State = ComboboxGroupState;
  type Props = ComboboxGroupProps;
}