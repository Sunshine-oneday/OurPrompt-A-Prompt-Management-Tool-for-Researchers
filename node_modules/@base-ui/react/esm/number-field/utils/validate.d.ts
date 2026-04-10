export declare function removeFloatingPointErrors(value: number, format?: Intl.NumberFormatOptions): number;
export declare function toValidatedNumber(value: number | null, {
  step,
  minWithDefault,
  maxWithDefault,
  minWithZeroDefault,
  format,
  snapOnStep,
  small,
  clamp: shouldClamp
}: {
  step: number | undefined;
  minWithDefault: number;
  maxWithDefault: number;
  minWithZeroDefault: number;
  format: Intl.NumberFormatOptions | undefined;
  snapOnStep: boolean;
  small: boolean;
  clamp: boolean;
}): number | null;