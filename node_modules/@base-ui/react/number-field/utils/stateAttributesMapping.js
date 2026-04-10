"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stateAttributesMapping = void 0;
var _constants = require("../../field/utils/constants");
const stateAttributesMapping = exports.stateAttributesMapping = {
  inputValue: () => null,
  value: () => null,
  ..._constants.fieldValidityMapping
};