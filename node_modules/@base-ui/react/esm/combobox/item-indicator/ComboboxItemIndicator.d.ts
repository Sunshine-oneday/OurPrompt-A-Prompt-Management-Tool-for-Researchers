import * as React from 'react';
import type { BaseUIComponentProps } from "../../utils/types.js";
import { type TransitionStatus } from "../../utils/useTransitionStatus.js";
/**
 * Indicates whether the item is selected.
 * Renders a `<span>` element.
 */
export declare const ComboboxItemIndicator: React.ForwardRefExoticComponent<Omit<ComboboxItemIndicatorProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
export interface ComboboxItemIndicatorProps extends BaseUIComponentProps<'span', ComboboxItemIndicatorState> {
  children?: React.ReactNode;
  /**
   * Whether to keep the HTML element in the DOM when the item is not selected.
   * @default false
   */
  keepMounted?: boolean | undefined;
}
export interface ComboboxItemIndicatorState {
  /**
   * Whether the item is selected.
   */
  selected: boolean;
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus;
}
export declare namespace ComboboxItemIndicator {
  type Props = ComboboxItemIndicatorProps;
  type State = ComboboxItemIndicatorState;
}