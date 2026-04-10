import * as React from 'react';
import type { BaseUIComponentProps, Orientation as BaseOrientation } from "../../utils/types.js";
import type { TabsTab } from "../tab/TabsTab.js";
import { type BaseUIChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { REASONS } from "../../utils/reasons.js";
/**
 * Groups the tabs and the corresponding panels.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tabs](https://base-ui.com/react/components/tabs)
 */
export declare const TabsRoot: React.ForwardRefExoticComponent<Omit<TabsRootProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export type TabsRootOrientation = BaseOrientation;
export interface TabsRootState {
  /**
   * The component orientation.
   */
  orientation: TabsRoot.Orientation;
  /**
   * The direction used for tab activation.
   */
  tabActivationDirection: TabsTab.ActivationDirection;
}
export interface TabsRootProps extends BaseUIComponentProps<'div', TabsRootState> {
  /**
   * The value of the currently active `Tab`. Use when the component is controlled.
   * When the value is `null`, no Tab will be active.
   */
  value?: TabsTab.Value | undefined;
  /**
   * The default value. Use when the component is not controlled.
   * When the value is `null`, no Tab will be active.
   * @default 0
   */
  defaultValue?: TabsTab.Value | undefined;
  /**
   * The component orientation (layout flow direction).
   * @default 'horizontal'
   */
  orientation?: TabsRoot.Orientation | undefined;
  /**
   * Callback invoked when new value is being set.
   */
  onValueChange?: ((value: TabsTab.Value, eventDetails: TabsRoot.ChangeEventDetails) => void) | undefined;
}
export type TabsRootChangeEventReason = typeof REASONS.none;
export type TabsRootChangeEventDetails = BaseUIChangeEventDetails<TabsRoot.ChangeEventReason, {
  activationDirection: TabsTab.ActivationDirection;
}>;
export declare namespace TabsRoot {
  type State = TabsRootState;
  type Props = TabsRootProps;
  type Orientation = TabsRootOrientation;
  type ChangeEventReason = TabsRootChangeEventReason;
  type ChangeEventDetails = TabsRootChangeEventDetails;
}