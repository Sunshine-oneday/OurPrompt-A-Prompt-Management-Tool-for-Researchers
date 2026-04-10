import * as React from 'react';
import type { Orientation } from "../utils/types.js";
import type { BaseUIChangeEventDetails } from "../utils/createBaseUIEventDetails.js";
import type { BaseUIEventReasons } from "../utils/reasons.js";
export interface ToggleGroupContext<Value> {
  value: readonly Value[];
  setGroupValue: (newValue: Value, nextPressed: boolean, eventDetails: BaseUIChangeEventDetails<BaseUIEventReasons['none']>) => void;
  disabled: boolean;
  orientation: Orientation;
  /**
   * Indicates whether the value has been initialized via `value` or `defaultValue` props.
   * Used to determine if Toggle should warn users about data inconsistency problems.
   */
  isValueInitialized: boolean;
}
export declare const ToggleGroupContext: React.Context<ToggleGroupContext<any> | undefined>;
export declare function useToggleGroupContext<Value>(optional?: boolean): ToggleGroupContext<Value> | undefined;