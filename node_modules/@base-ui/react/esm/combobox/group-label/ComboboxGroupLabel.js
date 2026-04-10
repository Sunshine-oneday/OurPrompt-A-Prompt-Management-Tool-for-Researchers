'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useComboboxGroupContext } from "../group/ComboboxGroupContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * An accessible label that is automatically associated with its parent group.
 * Renders a `<div>` element.
 */
export const ComboboxGroupLabel = /*#__PURE__*/React.forwardRef(function ComboboxGroupLabel(componentProps, forwardedRef) {
  const {
    render,
    className,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    setLabelId
  } = useComboboxGroupContext();
  const id = useBaseUiId(idProp);
  useIsoLayoutEffect(() => {
    setLabelId(id);
    return () => {
      setLabelId(undefined);
    };
  }, [id, setLabelId]);
  const element = useRenderElement('div', componentProps, {
    ref: forwardedRef,
    props: [{
      id
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") ComboboxGroupLabel.displayName = "ComboboxGroupLabel";