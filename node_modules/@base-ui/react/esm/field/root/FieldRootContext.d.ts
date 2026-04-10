import * as React from 'react';
import type { FieldValidityData, FieldRootState } from "./FieldRoot.js";
import type { Form } from "../../form/index.js";
import type { UseFieldValidationReturnValue } from "./useFieldValidation.js";
export interface FieldRootContext {
  invalid: boolean | undefined;
  name: string | undefined;
  validityData: FieldValidityData;
  setValidityData: React.Dispatch<React.SetStateAction<FieldValidityData>>;
  disabled: boolean | undefined;
  touched: boolean;
  setTouched: React.Dispatch<React.SetStateAction<boolean>>;
  dirty: boolean;
  setDirty: React.Dispatch<React.SetStateAction<boolean>>;
  filled: boolean;
  setFilled: React.Dispatch<React.SetStateAction<boolean>>;
  focused: boolean;
  setFocused: React.Dispatch<React.SetStateAction<boolean>>;
  validate: (value: unknown, formValues: Record<string, unknown>) => string | string[] | null | Promise<string | string[] | null>;
  validationMode: Form.ValidationMode;
  validationDebounceTime: number;
  shouldValidateOnChange: () => boolean;
  state: FieldRootState;
  markedDirtyRef: React.RefObject<boolean>;
  validation: UseFieldValidationReturnValue;
}
export declare const FieldRootContext: React.Context<FieldRootContext>;
export declare function useFieldRootContext(optional?: boolean): FieldRootContext;