class ConfirmDialog {
  confirmDialog;

  show(config) {
    this.confirmDialog.show(config);
    return this;
  }

  dismiss() {
    this.confirmDialog.dismiss();
  }

  onPositiveButton(text, callback = null) {
    this.confirmDialog.onPositiveButton(text, callback);
    return this;
  }

  onNegativeButton(text, callback = null) {
    this.confirmDialog.onNegativeButton(text, callback);
    return this;
  }
}

export default new ConfirmDialog();
