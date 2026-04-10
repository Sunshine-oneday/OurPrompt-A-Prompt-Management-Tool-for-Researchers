import * as React from 'react';
import type { Form } from "../../form/index.js";
import type { HTMLProps } from "../../utils/types.js";
import type { FieldValidityData, FieldRootState } from "./FieldRoot.js";
export declare function useFieldValidation(params: UseFieldValidationParameters): UseFieldValidationReturnValue;
export interface UseFieldValidationParameters {
  setValidityData: (data: FieldValidityData) => void;
  validate: (value: unknown, formValues: Form.Values) => string | string[] | null | Promise<string | string[] | null>;
  validityData: FieldValidityData;
  validationDebounceTime: number;
  invalid: boolean;
  markedDirtyRef: React.RefObject<boolean>;
  state: FieldRootState;
  name: string | undefined;
  shouldValidateOnChange: () => boolean;
}
export interface UseFieldValidationReturnValue {
  getValidationProps: (props?: HTMLProps) => HTMLProps;
  getInputValidationProps: (props?: HTMLProps) => HTMLProps;
  inputRef: React.RefObject<HTMLInputElement | null>;
  commit: (value: unknown, revalidate?: boolean) => Promise<void>;
}