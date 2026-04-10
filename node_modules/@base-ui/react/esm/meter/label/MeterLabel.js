'use client';

import * as React from 'react';
import { useMeterRootContext } from "../root/MeterRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useRegisteredLabelId } from "../../utils/useRegisteredLabelId.js";

/**
 * An accessible label for the meter.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Meter](https://base-ui.com/react/components/meter)
 */
export const MeterLabel = /*#__PURE__*/React.forwardRef(function MeterLabel(componentProps, forwardedRef) {
  const {
    render,
    className,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    setLabelId
  } = useMeterRootContext();
  const id = useRegisteredLabelId(idProp, setLabelId);
  return useRenderElement('span', componentProps, {
    ref: forwardedRef,
    props: [{
      id,
      role: 'presentation'
    }, elementProps]
  });
});
if (process.env.NODE_ENV !== "production") MeterLabel.displayName = "MeterLabel";