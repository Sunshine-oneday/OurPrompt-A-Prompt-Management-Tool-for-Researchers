'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useSelectGroupContext } from "../group/SelectGroupContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";

/**
 * An accessible label that is automatically associated with its parent group.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
export const SelectGroupLabel = /*#__PURE__*/React.forwardRef(function SelectGroupLabel(componentProps, forwardedRef) {
  const {
    className,
    render,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    setLabelId
  } = useSelectGroupContext();
  const id = useBaseUiId(idProp);
  useIsoLayoutEffect(() => {
    setLabelId(id);
  }, [id, setLabelId]);
  const element = useRenderElement('div', componentProps, {
    ref: forwardedRef,
    props: [{
      id
    }, elementProps]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") SelectGroupLabel.displayName = "SelectGroupLabel";