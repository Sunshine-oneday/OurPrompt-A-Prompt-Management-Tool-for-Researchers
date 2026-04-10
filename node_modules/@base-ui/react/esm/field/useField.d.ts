export declare function useField(params: UseFieldParameters): void;
export interface UseFieldParameters {
  enabled?: boolean | undefined;
  value: unknown;
  getValue?: (() => unknown) | undefined;
  id: string | undefined;
  name?: string | undefined;
  commit: (value: unknown) => void;
  /**
   * A ref to a focusable element that receives focus when the field fails
   * validation during form submission.
   */
  controlRef: React.RefObject<any>;
}