'use client';

import * as React from 'react';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useRegisteredLabelId } from "../../utils/useRegisteredLabelId.js";
import { useProgressRootContext } from "../root/ProgressRootContext.js";
import { progressStateAttributesMapping } from "../root/stateAttributesMapping.js";
/**
 * An accessible label for the progress bar.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Progress](https://base-ui.com/react/components/progress)
 */
export const ProgressLabel = /*#__PURE__*/React.forwardRef(function ProgressLabel(componentProps, forwardedRef) {
  const {
    render,
    className,
    id: idProp,
    ...elementProps
  } = componentProps;
  const {
    setLabelId,
    state
  } = useProgressRootContext();
  const id = useRegisteredLabelId(idProp, setLabelId);
  const element = useRenderElement('span', componentProps, {
    state,
    ref: forwardedRef,
    props: [{
      id,
      role: 'presentation'
    }, elementProps],
    stateAttributesMapping: progressStateAttributesMapping
  });
  return element;
});
if (process.env.NODE_ENV !== "production") ProgressLabel.displayName = "ProgressLabel";