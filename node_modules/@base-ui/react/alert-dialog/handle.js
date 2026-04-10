"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAlertDialogHandle = createAlertDialogHandle;
var _DialogHandle = require("../dialog/store/DialogHandle");
var _DialogStore = require("../dialog/store/DialogStore");
function createAlertDialogHandle() {
  return new _DialogHandle.DialogHandle(new _DialogStore.DialogStore({
    modal: true,
    disablePointerDismissal: true,
    role: 'alertdialog'
  }));
}