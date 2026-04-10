import * as React from 'react';
import type { ElementProps } from "../types.js";
import { ACTIVE_KEY, SELECTED_KEY } from "../utils/constants.js";
export type ExtendedUserProps = {
  [ACTIVE_KEY]?: boolean | undefined;
  [SELECTED_KEY]?: boolean | undefined;
};
export interface UseInteractionsReturn {
  getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
  getItemProps: (userProps?: Omit<React.HTMLProps<HTMLElement>, 'selected' | 'active'> & ExtendedUserProps) => Record<string, unknown>;
  getTriggerProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
}
/**
 * Merges an array of interaction hooks' props into prop getters, allowing
 * event handler functions to be composed together without overwriting one
 * another.
 * @see https://floating-ui.com/docs/useInteractions
 */
export declare function useInteractions(propsList?: Array<ElementProps | void>): UseInteractionsReturn;