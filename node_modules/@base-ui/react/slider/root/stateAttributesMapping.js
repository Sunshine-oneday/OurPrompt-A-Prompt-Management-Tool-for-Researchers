"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sliderStateAttributesMapping = void 0;
var _constants = require("../../field/utils/constants");
const sliderStateAttributesMapping = exports.sliderStateAttributesMapping = {
  activeThumbIndex: () => null,
  max: () => null,
  min: () => null,
  minStepsBetweenValues: () => null,
  step: () => null,
  values: () => null,
  ..._constants.fieldValidityMapping
};