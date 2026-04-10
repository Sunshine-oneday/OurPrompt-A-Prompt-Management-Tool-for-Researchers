"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeFloatingPointErrors = removeFloatingPointErrors;
exports.toValidatedNumber = toValidatedNumber;
var _clamp = require("../../utils/clamp");
var _formatNumber = require("../../utils/formatNumber");
const STEP_EPSILON_FACTOR = 1e-10;
function getFractionDigits(format) {
  const defaultOptions = (0, _formatNumber.getFormatter)('en-US').resolvedOptions();
  const minimumFractionDigits = format?.minimumFractionDigits ?? defaultOptions.minimumFractionDigits ?? 0;
  const maximumFractionDigits = Math.max(format?.maximumFractionDigits ?? defaultOptions.maximumFractionDigits ?? 20, minimumFractionDigits);
  return {
    maximumFractionDigits,
    minimumFractionDigits
  };
}
function roundToFractionDigits(value, maximumFractionDigits) {
  if (!Number.isFinite(value)) {
    return value;
  }
  const digits = Math.min(Math.max(maximumFractionDigits, 0), 20);
  return Number(value.toFixed(digits));
}
function removeFloatingPointErrors(value, format) {
  const {
    maximumFractionDigits
  } = getFractionDigits(format);
  return roundToFractionDigits(value, maximumFractionDigits);
}
function snapToStep(clampedValue, base, step, mode = 'directional') {
  if (step === 0) {
    return clampedValue;
  }
  const stepSize = Math.abs(step);
  const direction = Math.sign(step);
  const tolerance = stepSize * STEP_EPSILON_FACTOR * direction;
  const divisor = mode === 'nearest' ? step : stepSize;
  const rawSteps = (clampedValue - base + tolerance) / divisor;
  let snappedSteps;
  if (mode === 'nearest') {
    snappedSteps = Math.round(rawSteps);
  } else if (direction > 0) {
    snappedSteps = Math.floor(rawSteps);
  } else {
    snappedSteps = Math.ceil(rawSteps);
  }
  const stepForResult = mode === 'nearest' ? step : stepSize;
  return base + snappedSteps * stepForResult;
}
function toValidatedNumber(value, {
  step,
  minWithDefault,
  maxWithDefault,
  minWithZeroDefault,
  format,
  snapOnStep,
  small,
  clamp: shouldClamp
}) {
  if (value === null) {
    return value;
  }
  const clampedValue = shouldClamp ? (0, _clamp.clamp)(value, minWithDefault, maxWithDefault) : value;
  if (step != null && snapOnStep) {
    if (step === 0) {
      return removeFloatingPointErrors(clampedValue, format);
    }

    // If a real minimum is provided, use it
    let base = minWithZeroDefault;
    if (!small && minWithDefault !== Number.MIN_SAFE_INTEGER) {
      base = minWithDefault;
    }
    const snappedValue = snapToStep(clampedValue, base, step, small ? 'nearest' : 'directional');
    return removeFloatingPointErrors(snappedValue, format);
  }
  return removeFloatingPointErrors(clampedValue, format);
}