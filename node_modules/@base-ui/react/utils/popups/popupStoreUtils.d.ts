import * as React from 'react';
import { ReactStore } from '@base-ui/utils/store';
import { PopupStoreState, PopupStoreContext, popupStoreSelectors, PopupStoreSelectors } from "./store.js";
/**
 * Returns a callback ref that registers/unregisters the trigger element in the store.
 *
 * @param store The Store instance where the trigger should be registered.
 */
export declare function useTriggerRegistration<State extends PopupStoreState<any>>(id: string | undefined, store: ReactStore<State, PopupStoreContext<any>, PopupStoreSelectors>): (element: Element | null) => void;
/**
 * Sets up trigger data forwarding to the store.
 *
 * @param triggerId Id of the trigger.
 * @param triggerElement The trigger DOM element.
 * @param store The Store instance managing the popup state.
 * @param stateUpdates An object with state updates to apply when the trigger is active.
 */
export declare function useTriggerDataForwarding<State extends PopupStoreState<any>>(triggerId: string | undefined, triggerElementRef: React.RefObject<Element | null>, store: ReactStore<State, PopupStoreContext<any>, typeof popupStoreSelectors>, stateUpdates: Omit<Partial<State>, 'activeTriggerId' | 'activeTriggerElement'>): {
  registerTrigger: (element: Element | null) => void;
  isMountedByThisTrigger: boolean;
};
export type PayloadChildRenderFunction<Payload> = (arg: {
  payload: Payload | undefined;
}) => React.ReactNode;
/**
 * Ensures that when there's only one trigger element registered, it is set as the active trigger.
 * This allows controlled popups to work correctly without an explicit triggerId, maintaining compatibility
 * with the contained triggers.
 *
 * This should be called on the Root part.
 *
 * @param open Whether the popup is open.
 * @param store The Store instance managing the popup state.
 */
export declare function useImplicitActiveTrigger<State extends PopupStoreState<any>>(store: ReactStore<State, PopupStoreContext<any>, typeof popupStoreSelectors>): void;
/**
 * Mangages the mounted state of the popup.
 * Sets up the transition status listeners and handles unmounting when needed.
 * Updates the `mounted` and `transitionStatus` states in the store.
 *
 * @param open Whether the popup is open.
 * @param store The Store instance managing the popup state.
 * @param onUnmount Optional callback to be called when the popup is unmounted.
 *
 * @returns A function to forcibly unmount the popup.
 */
export declare function useOpenStateTransitions<State extends PopupStoreState<any>>(open: boolean, store: ReactStore<State, PopupStoreContext<any>, typeof popupStoreSelectors>, onUnmount?: () => void): {
  forceUnmount: () => void;
  transitionStatus: import("../useTransitionStatus.js").TransitionStatus;
};