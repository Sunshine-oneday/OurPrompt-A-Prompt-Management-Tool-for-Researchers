import * as React from 'react';
import { BaseUIChangeEventDetails } from "../../utils/createBaseUIEventDetails.js";
import { DialogHandle } from "../../dialog/store/DialogHandle.js";
import type { DialogRoot } from "../../dialog/root/DialogRoot.js";
/**
 * Groups all parts of the alert dialog.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Alert Dialog](https://base-ui.com/react/components/alert-dialog)
 */
export declare function AlertDialogRoot<Payload>(props: AlertDialogRoot.Props<Payload>): import("react/jsx-runtime").JSX.Element;
export interface AlertDialogRootState {}
export interface AlertDialogRootProps<Payload = unknown> extends Omit<DialogRoot.Props<Payload>, 'modal' | 'disablePointerDismissal' | 'onOpenChange' | 'actionsRef' | 'handle'> {
  /**
   * Event handler called when the dialog is opened or closed.
   */
  onOpenChange?: ((open: boolean, eventDetails: AlertDialogRoot.ChangeEventDetails) => void) | undefined;
  /**
   * A ref to imperative actions.
   * - `unmount`: When specified, the dialog will not be unmounted when closed.
   * Instead, the `unmount` function must be called to unmount the dialog manually.
   * Useful when the dialog's animation is controlled by an external library.
   * - `close`: Closes the dialog imperatively when called.
   */
  actionsRef?: React.RefObject<AlertDialogRoot.Actions | null> | undefined;
  /**
   * A handle to associate the alert dialog with a trigger.
   * If specified, allows external triggers to control the alert dialog's open state.
   * Can be created with the AlertDialog.createHandle() method.
   */
  handle?: DialogHandle<Payload> | undefined;
}
export type AlertDialogRootActions = DialogRoot.Actions;
export type AlertDialogRootChangeEventReason = DialogRoot.ChangeEventReason;
export type AlertDialogRootChangeEventDetails = BaseUIChangeEventDetails<AlertDialogRoot.ChangeEventReason> & {
  preventUnmountOnClose(): void;
};
export declare namespace AlertDialogRoot {
  type State = AlertDialogRootState;
  type Props<Payload = unknown> = AlertDialogRootProps<Payload>;
  type Actions = AlertDialogRootActions;
  type ChangeEventReason = AlertDialogRootChangeEventReason;
  type ChangeEventDetails = AlertDialogRootChangeEventDetails;
}