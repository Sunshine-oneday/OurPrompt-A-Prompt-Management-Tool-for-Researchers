import { DialogHandle } from "../dialog/store/DialogHandle.js";
import { DialogStore } from "../dialog/store/DialogStore.js";
export function createAlertDialogHandle() {
  return new DialogHandle(new DialogStore({
    modal: true,
    disablePointerDismissal: true,
    role: 'alertdialog'
  }));
}