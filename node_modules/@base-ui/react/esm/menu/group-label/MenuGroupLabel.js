'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useRenderElement } from "../../utils/useRenderElement.js";
import { useBaseUiId } from "../../utils/useBaseUiId.js";
import { useMenuGroupRootContext } from "../group/MenuGroupContext.js";

/**
 * An accessible label that is automatically associated with its parent group.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
export const MenuGroupLabel = /*#__PURE__*/React.forwardRef(function MenuGroupLabelComponent(componentProps, forwardedRef) {
  const {
    className,
    render,
    id: idProp,
    ...elementProps
  } = componentProps;
  const id = useBaseUiId(idProp);
  const {
    setLabelId
  } = useMenuGroupRootContext();
  useIsoLayoutEffect(() => {
    setLabelId(id);
    return () => {
      setLabelId(undefined);
    };
  }, [setLabelId, id]);
  return useRenderElement('div', componentProps, {
    ref: forwardedRef,
    props: {
      id,
      role: 'presentation',
      ...elementProps
    }
  });
});
if (process.env.NODE_ENV !== "production") MenuGroupLabel.displayName = "MenuGroupLabel";