import * as React from 'react';
export type MeterRootContext = {
  formattedValue: string;
  max: number;
  min: number;
  setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
  value: number;
};
export declare const MeterRootContext: React.Context<MeterRootContext | undefined>;
export declare function useMeterRootContext(): MeterRootContext;