import type { ReferenceType } from "../types.js";
import type { BaseUIChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { FloatingRootStore } from "../components/FloatingRootStore.js";
export interface UseFloatingRootContextOptions {
  open?: boolean | undefined;
  onOpenChange?(open: boolean, eventDetails: BaseUIChangeEventDetails<string>): void;
  elements?: {
    reference?: ReferenceType | null | undefined;
    floating?: HTMLElement | null | undefined;
  } | undefined;
}
export declare function useFloatingRootContext(options: UseFloatingRootContextOptions): FloatingRootStore;