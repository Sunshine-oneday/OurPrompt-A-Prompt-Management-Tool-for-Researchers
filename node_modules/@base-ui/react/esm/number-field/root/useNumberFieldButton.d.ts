import * as React from 'react';
import type { Timeout } from '@base-ui/utils/useTimeout';
import type { EventWithOptionalKeyState, IncrementValueParameters } from "../utils/types.js";
import type { NumberFieldRoot } from "./NumberFieldRoot.js";
import type { HTMLProps } from "../../utils/types.js";
export declare function useNumberFieldButton(params: UseNumberFieldButtonParameters): React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
export interface UseNumberFieldButtonParameters {
  allowInputSyncRef: React.RefObject<boolean | null>;
  disabled: boolean;
  formatOptionsRef: React.RefObject<Intl.NumberFormatOptions | undefined>;
  getStepAmount: (event?: EventWithOptionalKeyState) => number | undefined;
  id: string | undefined;
  incrementValue: (amount: number, params: IncrementValueParameters) => boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputValue: string;
  intentionalTouchCheckTimeout: Timeout;
  isIncrement: boolean;
  isPressedRef: React.RefObject<boolean | null>;
  locale?: Intl.LocalesArgument | undefined;
  movesAfterTouchRef: React.RefObject<number | null>;
  readOnly: boolean;
  setValue: (value: number | null, details: NumberFieldRoot.ChangeEventDetails) => boolean;
  startAutoChange: (isIncrement: boolean, event?: React.MouseEvent | Event) => void;
  stopAutoChange: () => void;
  valueRef: React.RefObject<number | null>;
  lastChangedValueRef: React.RefObject<number | null>;
  onValueCommitted: (value: number | null, eventDetails: NumberFieldRoot.CommitEventDetails) => void;
}
export interface UseNumberFieldButtonReturnValue {
  props: HTMLProps;
}
export interface UseNumberFieldButtonState {}