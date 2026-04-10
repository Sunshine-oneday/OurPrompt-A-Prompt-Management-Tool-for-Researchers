'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { isSafari } from '@base-ui/utils/detectBrowser';
import { visuallyHidden } from '@base-ui/utils/visuallyHidden';

/**
 * @internal
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const FocusGuard = /*#__PURE__*/React.forwardRef(function FocusGuard(props, ref) {
  const [role, setRole] = React.useState();
  useIsoLayoutEffect(() => {
    if (isSafari) {
      // Unlike other screen readers such as NVDA and JAWS, the virtual cursor
      // on VoiceOver does trigger the onFocus event, so we can use the focus
      // trap element. On Safari, only buttons trigger the onFocus event.
      setRole('button');
    }
  }, []);
  const restProps = {
    tabIndex: 0,
    // Role is only for VoiceOver
    role
  };
  return /*#__PURE__*/_jsx("span", {
    ...props,
    ref: ref,
    style: visuallyHidden,
    "aria-hidden": role ? undefined : true,
    ...restProps,
    "data-base-ui-focus-guard": ""
  });
});
if (process.env.NODE_ENV !== "production") FocusGuard.displayName = "FocusGuard";