import * as React from 'react';
import type { Orientation } from "../../utils/types.js";
import type { TextDirection } from "../../direction-provider/index.js";
import type { AccordionRoot } from "./AccordionRoot.js";
export interface AccordionRootContext<Value = any> {
  accordionItemRefs: React.RefObject<(HTMLElement | null)[]>;
  direction: TextDirection;
  disabled: boolean;
  handleValueChange: (newValue: AccordionRoot.Value<Value>[number], nextOpen: boolean) => void;
  hiddenUntilFound: boolean;
  keepMounted: boolean;
  loopFocus: boolean;
  orientation: Orientation;
  state: AccordionRoot.State<Value>;
  value: AccordionRoot.Value<Value>;
}
export declare const AccordionRootContext: React.Context<AccordionRootContext<any> | undefined>;
export declare function useAccordionRootContext<Value = any>(): AccordionRootContext<Value>;