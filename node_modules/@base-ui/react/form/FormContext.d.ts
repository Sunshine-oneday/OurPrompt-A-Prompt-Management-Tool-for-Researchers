import * as React from 'react';
import type { FieldValidityData } from "../field/root/FieldRoot.js";
import type { Form } from "./Form.js";
export type Errors = Record<string, string | string[]>;
export interface FormContext {
  errors: Errors;
  clearErrors: (name: string | undefined) => void;
  formRef: React.RefObject<{
    fields: Map<string, {
      name: string | undefined;
      validate: (flushSync?: boolean | undefined) => void;
      validityData: FieldValidityData;
      controlRef: React.RefObject<HTMLElement | null>;
      getValue: () => unknown;
    }>;
  }>;
  validationMode: Form.ValidationMode;
  submitAttemptedRef: React.RefObject<boolean>;
}
export declare const FormContext: React.Context<FormContext>;
export declare function useFormContext(): FormContext;