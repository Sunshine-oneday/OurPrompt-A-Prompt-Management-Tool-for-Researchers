import * as React from 'react';
import type { BaseUIComponentProps } from "../../utils/types.js";
/**
 * A list container for the items.
 * Renders a `<div>` element.
 */
export declare const ComboboxList: React.ForwardRefExoticComponent<Omit<ComboboxListProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxListState {
  /**
   * Whether the list is empty.
   */
  empty: boolean;
}
export interface ComboboxListProps extends Omit<BaseUIComponentProps<'div', ComboboxListState>, 'children'> {
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
}
export declare namespace ComboboxList {
  type State = ComboboxListState;
  type Props = ComboboxListProps;
}