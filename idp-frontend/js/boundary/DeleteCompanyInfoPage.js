/*
 * Boundary: DeleteCompanyInfoPage
 * Normal flow: "Delete Company Info" → "Are you sure? This action cannot be undone." → Delete
 *              → "Company Information Deleted Successfully" → dashboard
 * Alternate:   Cancel; "Failed to delete company information. Please try again."
 */
class DeleteCompanyInfoPage {
  constructor(session) {
    this.session = session;
    this.controller = new DeleteCompanyInfoController();
    this.modal = UI.el('delete-modal');
    this.lastFocus = null;
  }

  displayPage() {
    UI.el('delete-btn').addEventListener('click', () => this.open());
    UI.el('delete-cancel').addEventListener('click', () => this.close());
    UI.el('delete-confirm').addEventListener('click', () => this.onConfirm());
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !this.modal.hidden) this.close(); });
  }

  open() {
    UI.clearBanner();
    this.lastFocus = document.activeElement;
    this.modal.hidden = false;
    UI.el('delete-cancel').focus();
  }

  close() {
    this.modal.hidden = true;
    if (this.lastFocus) this.lastFocus.focus();
  }

  onConfirm() {
    this.close();
    const result = this.controller.deleteCompanyInfo(this.session.accountId);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }

  displaySuccess(result) {
    UI.setFlash('success', result.message);
    location.href = result.redirect;
  }
}
