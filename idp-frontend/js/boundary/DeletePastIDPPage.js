/*
 * Boundary: DeletePastIDPPage — "Delete IDP" on the past IDP page.
 * Normal flow: Delete IDP → confirm → "IDP Deleted Successfully" → Past IDPs
 * Alternate:   Cancel; "Deletion failed."
 */
class DeletePastIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new DeletePastIDPController();
    this.id = UI.param('id');
  }

  displayPage() {
    this.dialog = new ConfirmDialog('delete-modal', 'delete-cancel', 'delete-confirm', () => this.onConfirm());
    UI.el('delete-btn').addEventListener('click', () => { UI.clearBanner(); this.dialog.open(); });
  }

  onConfirm() {
    const result = this.controller.deletePastIDP(this.session.accountId, this.id);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }

  displaySuccess(result) {
    UI.setFlash('success', `${result.message} — “${result.project.getProjectName()}” removed from your portfolio.`);
    location.href = result.redirect;
  }
}
