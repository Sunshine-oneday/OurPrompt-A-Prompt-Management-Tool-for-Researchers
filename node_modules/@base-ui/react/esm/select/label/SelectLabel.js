'use client';

import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useFieldRootContext } from "../../field/root/FieldRootContext.js";
import { fieldValidityMapping } from "../../field/utils/constants.js";
import { useLabel } from "../../labelable-provider/useLabel.js";
import { getDefaultLabelId } from "../../utils/resolveAriaLabelledBy.js";
import { useSelectRootContext } from "../root/SelectRootContext.js";
import { selectors } from "../store.js";

/**
 * An accessible label that is automatically associated with the select trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Select](https://base-ui.com/react/components/select)
 */
export const SelectLabel = /*#__PURE__*/React.forwardRef(function SelectLabel(componentProps, forwardedRef) {
  const {
    render,
    className,
    ...elementProps
  } = componentProps;
  // Keep label id derived from the root and ignore runtime `id` overrides from untyped consumers.
  const elementPropsWithoutId = elementProps;
  delete elementPropsWithoutId.id;
  const fieldRootContext = useFieldRootContext();
  const {
    store
  } = useSelectRootContext();
  const triggerElement = useStore(store, selectors.triggerElement);
  const rootId = useStore(store, selectors.id);
  const defaultLabelId = getDefaultLabelId(rootId);
  const labelProps = useLabel({
    id: defaultLabelId,
    fallbackControlId: triggerElement?.id ?? rootId,
    setLabelId(nextLabelId) {
      store.set('labelId', nextLabelId);
    }
  });
  return useRenderElement('div', componentProps, {
    ref: forwardedRef,
    state: fieldRootContext.state,
    props: [labelProps, elementProps],
    stateAttributesMapping: fieldValidityMapping
  });
});
if (process.env.NODE_ENV !== "production") SelectLabel.displayName = "SelectLabel";