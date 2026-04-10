import * as React from 'react';
import { type FloatingEvents } from "../../floating-ui-react/index.js";
import type { SelectStore } from "../store.js";
import type { UseFieldValidationReturnValue } from "../../field/root/useFieldValidation.js";
import type { HTMLProps } from "../../utils/types.js";
import type { SelectRoot } from "./SelectRoot.js";
export interface SelectRootContext {
  store: SelectStore;
  name: string | undefined;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  multiple: boolean;
  highlightItemOnHover: boolean;
  setValue: (nextValue: any, eventDetails: SelectRoot.ChangeEventDetails) => void;
  setOpen: (open: boolean, eventDetails: SelectRoot.ChangeEventDetails) => void;
  listRef: React.RefObject<Array<HTMLElement | null>>;
  popupRef: React.RefObject<HTMLDivElement | null>;
  scrollHandlerRef: React.RefObject<((el: HTMLDivElement) => void) | null>;
  handleScrollArrowVisibility: () => void;
  scrollArrowsMountedCountRef: React.RefObject<number>;
  getItemProps: (props?: HTMLProps & {
    active?: boolean | undefined;
    selected?: boolean | undefined;
  }) => Record<string, unknown>;
  events: FloatingEvents;
  valueRef: React.RefObject<HTMLSpanElement | null>;
  valuesRef: React.RefObject<Array<any>>;
  labelsRef: React.RefObject<Array<string | null>>;
  typingRef: React.RefObject<boolean>;
  selectionRef: React.RefObject<{
    allowUnselectedMouseUp: boolean;
    allowSelectedMouseUp: boolean;
  }>;
  selectedItemTextRef: React.RefObject<HTMLSpanElement | null>;
  validation: UseFieldValidationReturnValue;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  keyboardActiveRef: React.RefObject<boolean>;
  alignItemWithTriggerActiveRef: React.RefObject<boolean>;
  initialValueRef: React.RefObject<any>;
}
export declare const SelectRootContext: React.Context<SelectRootContext | null>;
export declare const SelectFloatingContext: React.Context<import("../../floating-ui-react/components/FloatingRootStore.js").FloatingRootStore | null>;
export declare function useSelectRootContext(): SelectRootContext;
export declare function useSelectFloatingContext(): import("../../floating-ui-react/components/FloatingRootStore.js").FloatingRootStore;