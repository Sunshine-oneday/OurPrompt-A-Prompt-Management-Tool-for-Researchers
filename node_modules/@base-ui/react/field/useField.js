"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useField = useField;
var ReactDOM = _interopRequireWildcard(require("react-dom"));
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _useStableCallback = require("@base-ui/utils/useStableCallback");
var _getCombinedFieldValidityData = require("./utils/getCombinedFieldValidityData");
var _FormContext = require("../form/FormContext");
var _FieldRootContext = require("./root/FieldRootContext");
function useField(params) {
  const {
    enabled = true,
    value,
    id,
    name,
    controlRef,
    commit
  } = params;
  const {
    formRef
  } = (0, _FormContext.useFormContext)();
  const {
    invalid,
    markedDirtyRef,
    validityData,
    setValidityData
  } = (0, _FieldRootContext.useFieldRootContext)();
  const getValue = (0, _useStableCallback.useStableCallback)(params.getValue);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!enabled) {
      return;
    }
    let initialValue = value;
    if (initialValue === undefined) {
      initialValue = getValue();
    }
    if (validityData.initialValue === null && initialValue !== null) {
      setValidityData(prev => ({
        ...prev,
        initialValue
      }));
    }
  }, [enabled, setValidityData, value, validityData.initialValue, getValue]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (!enabled || !id) {
      return;
    }
    formRef.current.fields.set(id, {
      getValue,
      name,
      controlRef,
      validityData: (0, _getCombinedFieldValidityData.getCombinedFieldValidityData)(validityData, invalid),
      validate(flushSync = true) {
        let nextValue = value;
        if (nextValue === undefined) {
          nextValue = getValue();
        }
        markedDirtyRef.current = true;
        if (!flushSync) {
          commit(nextValue);
        } else {
          // Synchronously update the validity state so the submit event can be prevented.
          ReactDOM.flushSync(() => commit(nextValue));
        }
      }
    });
  }, [commit, controlRef, enabled, formRef, getValue, id, invalid, markedDirtyRef, name, validityData, value]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    const fields = formRef.current.fields;
    return () => {
      if (id) {
        fields.delete(id);
      }
    };
  }, [formRef, id]);
}