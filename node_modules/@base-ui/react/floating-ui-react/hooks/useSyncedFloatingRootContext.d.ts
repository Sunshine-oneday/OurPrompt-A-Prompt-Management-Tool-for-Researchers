import { ReactStore } from '@base-ui/utils/store';
import { BaseUIChangeEventDetails } from "../../types/index.js";
import { PopupStoreContext, PopupStoreSelectors, PopupStoreState } from "../../utils/popups/index.js";
import { FloatingRootStore } from "../components/FloatingRootStore.js";
export interface UseSyncedFloatingRootContextOptions<State extends PopupStoreState<any>> {
  popupStore: ReactStore<State, PopupStoreContext<any>, PopupStoreSelectors>;
  /**
   * Whether to prevent the auto-emitted `openchange` event.
   */
  noEmit?: boolean | undefined;
  /**
   * Whether the Popup element is passed to Floating UI as the floating element instead of the default Positioner.
   */
  treatPopupAsFloatingElement?: boolean | undefined;
  onOpenChange(open: boolean, eventDetails: BaseUIChangeEventDetails<string>): void;
}
/**
 * Initializes a FloatingRootStore that is kept in sync with the provided PopupStore.
 * The new instance is created only once and updated on every render.
 */
export declare function useSyncedFloatingRootContext<State extends PopupStoreState<any>>(options: UseSyncedFloatingRootContextOptions<State>): FloatingRootStore;