import { type DialogRoot } from "./DialogRoot.js";
import { DialogStore } from "../store/DialogStore.js";
export declare function useDialogRoot(params: UseDialogRootParameters): UseDialogRootReturnValue;
export interface UseDialogRootSharedParameters {}
export interface UseDialogRootParameters {
  store: DialogStore<any>;
  actionsRef?: DialogRoot.Props['actionsRef'] | undefined;
  parentContext?: DialogStore<unknown>['context'] | undefined;
  onOpenChange: DialogRoot.Props['onOpenChange'];
  triggerIdProp?: string | null | undefined;
}
export type UseDialogRootReturnValue = void;
export interface UseDialogRootState {}