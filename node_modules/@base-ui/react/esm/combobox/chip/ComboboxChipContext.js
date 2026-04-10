'use client';

import _formatErrorMessage from "@base-ui/utils/formatErrorMessage";
import * as React from 'react';
export const ComboboxChipContext = /*#__PURE__*/React.createContext(undefined);
if (process.env.NODE_ENV !== "production") ComboboxChipContext.displayName = "ComboboxChipContext";
export function useComboboxChipContext() {
  const context = React.useContext(ComboboxChipContext);
  if (!context) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'useComboboxChipContext must be used within a ComboboxChip' : _formatErrorMessage(17));
  }
  return context;
}