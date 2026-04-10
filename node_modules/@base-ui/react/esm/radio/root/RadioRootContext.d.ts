import * as React from 'react';
export interface RadioRootContext {
  disabled: boolean;
  readOnly: boolean;
  checked: boolean;
  required: boolean;
}
export declare const RadioRootContext: React.Context<RadioRootContext | undefined>;
export declare function useRadioRootContext(): RadioRootContext;