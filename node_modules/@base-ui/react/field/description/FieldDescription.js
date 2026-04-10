"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FieldDescription = void 0;
var React = _interopRequireWildcard(require("react"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _FieldRootContext = require("../root/FieldRootContext");
var _LabelableContext = require("../../labelable-provider/LabelableContext");
var _constants = require("../utils/constants");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _useRenderElement = require("../../utils/useRenderElement");
/**
 * A paragraph with additional information about the field.
 * Renders a `<p>` element.
 *
 * Documentation: [Base UI Field](https://base-ui.com/react/components/field)
 */
const FieldDescription = exports.FieldDescription = /*#__PURE__*/React.forwardRef(function FieldDescription(componentProps, forwardedRef) {
  const {
    render,
    id: idProp,
    className,
    ...elementProps
  } = componentProps;
  const id = (0, _useBaseUiId.useBaseUiId)(idProp);
  const fieldRootContext = (0, _FieldRootContext.useFieldRootContext)(false);
  const {
    setMessageIds
  } = (0, _LabelableContext.useLabelableContext)();
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!id) {
      return undefined;
    }
    setMessageIds(v => v.concat(id));
    return () => {
      setMessageIds(v => v.filter(item => item !== id));
    };
  }, [id, setMessageIds]);
  const element = (0, _useRenderElement.useRenderElement)('p', componentProps, {
    ref: forwardedRef,
    state: fieldRootContext.state,
    props: [{
      id
    }, elementProps],
    stateAttributesMapping: _constants.fieldValidityMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") FieldDescription.displayName = "FieldDescription";