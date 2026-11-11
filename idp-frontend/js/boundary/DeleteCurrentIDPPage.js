/*
 * Boundary: DeleteCurrentIDPPage — "Delete IDP" on the current IDP page.
 * Normal flow: Delete IDP → confirm → "IDP Deleted Successfully" → Current IDPs
 * Alternate:   Cancel; "Deletion failed."
 */
class DeleteCurrentIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new DeleteCurrentIDPController();
    this.id = UI.param('id');
  }

  displayPage() {
    this.dialog = new ConfirmDialog('delete-modal', 'delete-cancel', 'delete-confirm', () => this.onConfirm());
    UI.el('delete-btn').addEventListener('click', () => { UI.clearBanner(); this.dialog.open(); });
  }

  onConfirm() {
    const result = this.controller.deleteCurrentIDP(this.session.accountId, this.id);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }

  displaySuccess(result) {
    UI.setFlash('success', `${result.message} — “${result.project.getProjectName()}”.`);
    location.href = result.redirect;
  }
}
