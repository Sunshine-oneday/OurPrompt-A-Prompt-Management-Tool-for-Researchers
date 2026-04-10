import * as React from 'react';
import type { BaseUIComponentProps } from "../../utils/types.js";
/**
 * An icon that indicates that the trigger button opens the popup.
 * Renders a `<span>` element.
 */
export declare const ComboboxIcon: React.ForwardRefExoticComponent<Omit<ComboboxIconProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
export interface ComboboxIconState {}
export interface ComboboxIconProps extends BaseUIComponentProps<'span', ComboboxIconState> {}
export declare namespace ComboboxIcon {
  type State = ComboboxIconState;
  type Props = ComboboxIconProps;
}