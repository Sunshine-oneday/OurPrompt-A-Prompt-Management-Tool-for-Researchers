'use client';

import { useRenderElement } from "../../utils/useRenderElement.js";
import { useCompositeItem } from "./useCompositeItem.js";
import { EMPTY_OBJECT, EMPTY_ARRAY } from "../../utils/constants.js";
/**
 * @internal
 */
export function CompositeItem(componentProps) {
  const {
    render,
    className,
    state = EMPTY_OBJECT,
    props = EMPTY_ARRAY,
    refs = EMPTY_ARRAY,
    metadata,
    stateAttributesMapping,
    tag = 'div',
    ...elementProps
  } = componentProps;
  const {
    compositeProps,
    compositeRef
  } = useCompositeItem({
    metadata
  });
  return useRenderElement(tag, componentProps, {
    state,
    ref: [...refs, compositeRef],
    props: [compositeProps, ...props, elementProps],
    stateAttributesMapping
  });
}