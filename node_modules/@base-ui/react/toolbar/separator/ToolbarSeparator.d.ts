import * as React from 'react';
import type { BaseUIComponentProps } from "../../utils/types.js";
import { Separator, type SeparatorState } from "../../separator/index.js";
/**
 * A separator element accessible to screen readers.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Toolbar](https://base-ui.com/react/components/toolbar)
 */
export declare const ToolbarSeparator: React.ForwardRefExoticComponent<Omit<ToolbarSeparatorProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export interface ToolbarSeparatorState extends SeparatorState {}
export interface ToolbarSeparatorProps extends BaseUIComponentProps<'div', ToolbarSeparatorState>, Separator.Props {}
export declare namespace ToolbarSeparator {
  type State = ToolbarSeparatorState;
  type Props = ToolbarSeparatorProps;
}