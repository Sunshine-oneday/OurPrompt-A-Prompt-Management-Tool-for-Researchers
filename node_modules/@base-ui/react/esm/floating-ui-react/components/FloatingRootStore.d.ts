import * as React from 'react';
import { ReactStore } from '@base-ui/utils/store';
import type { FloatingEvents, ContextData, ReferenceType } from "../types.js";
import { type BaseUIChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { type PopupTriggerMap } from "../../utils/popups/index.js";
export interface FloatingRootState {
  open: boolean;
  domReferenceElement: Element | null;
  referenceElement: ReferenceType | null;
  floatingElement: HTMLElement | null;
  positionReference: ReferenceType | null;
  /**
   * The ID of the floating element.
   */
  floatingId: string | undefined;
}
export interface FloatingRootStoreContext {
  onOpenChange: ((open: boolean, eventDetails: BaseUIChangeEventDetails<string>) => void) | undefined;
  readonly dataRef: React.RefObject<ContextData>;
  readonly events: FloatingEvents;
  nested: boolean;
  noEmit: boolean;
  readonly triggerElements: PopupTriggerMap;
}
declare const selectors: {
  open: (state: FloatingRootState) => boolean;
  domReferenceElement: (state: FloatingRootState) => Element | null;
  referenceElement: (state: FloatingRootState) => ReferenceType | null;
  floatingElement: (state: FloatingRootState) => HTMLElement | null;
  floatingId: (state: FloatingRootState) => string | undefined;
};
interface FloatingRootStoreOptions {
  open: boolean;
  referenceElement: ReferenceType | null;
  floatingElement: HTMLElement | null;
  triggerElements: PopupTriggerMap;
  floatingId: string | undefined;
  nested: boolean;
  noEmit: boolean;
  onOpenChange: ((open: boolean, eventDetails: BaseUIChangeEventDetails<string>) => void) | undefined;
}
export declare class FloatingRootStore extends ReactStore<Readonly<FloatingRootState>, FloatingRootStoreContext, typeof selectors> {
  constructor(options: FloatingRootStoreOptions);
  /**
   * Emits the `openchange` event through the internal event emitter and calls the `onOpenChange` handler with the provided arguments.
   *
   * @param newOpen The new open state.
   * @param eventDetails Details about the event that triggered the open state change.
   */
  setOpen: (newOpen: boolean, eventDetails: BaseUIChangeEventDetails<string>) => void;
}
export {};