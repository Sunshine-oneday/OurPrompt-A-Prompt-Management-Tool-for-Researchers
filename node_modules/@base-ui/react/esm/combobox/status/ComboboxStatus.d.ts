import * as React from 'react';
import { BaseUIComponentProps } from "../../utils/types.js";
/**
 * Displays a status message whose content changes are announced politely to screen readers.
 * Useful for conveying the status of an asynchronously loaded list.
 * Renders a `<div>` element.
 */
export declare const ComboboxStatus: React.ForwardRefExoticComponent<Omit<ComboboxStatusProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxStatusState {}
export interface ComboboxStatusProps extends BaseUIComponentProps<'div', ComboboxStatusState> {}
export declare namespace ComboboxStatus {
  type State = ComboboxStatusState;
  type Props = ComboboxStatusProps;
}