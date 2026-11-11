/*
 * Boundary: SuspendUserAccountPage
 * Opened as suspend-account.html?id=<account id>.
 * Normal flow: Suspend Account → confirm → status Inactive → "Account Suspended Successfully"
 * Alternate:   Cancel in the dialog; "Account is already suspended."
 */
class SuspendUserAccountPage {
  constructor() {
    this.controller = new SuspendUserAccountController();
    this.id = UI.param('id');
    this.modal = UI.el('confirm-modal');
    this.lastFocus = null;
  }

  displayPage() {
    const result = this.controller.getUserAccount(this.id);
    if (!result.success) {
      UI.el('crumb-user').textContent = 'Not found';
      UI.showBanner('error', `${UI.escape(result.message)} <a href="user-accounts.html">Go to User Accounts</a>`);
      return;
    }

    this.show(result.account);
    UI.el('account-card').hidden = false;

    UI.el('suspend-btn').addEventListener('click', () => this.onSuspendClicked());
    UI.el('confirm-cancel').addEventListener('click', () => this.closeDialog());
    UI.el('confirm-yes').addEventListener('click', () => this.onConfirm());
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.closeDialog(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !this.modal.hidden) this.closeDialog(); });
  }

  show(account) {
    UI.el('crumb-user').textContent = account.getUsername();
    UI.el('d-username').textContent = account.getUsername();
    UI.el('d-email').textContent = account.getEmail();
    UI.el('d-phone').textContent = account.getPhone() || '—';
    UI.el('d-role').textContent = account.getRole();
    UI.el('d-status').innerHTML = UI.statusPill(account.getStatus());
    UI.el('back-link').href = `user-accounts.html?id=${encodeURIComponent(account.getId())}`;
    UI.el('confirm-title').textContent = `Suspend ${account.getUsername()}?`;
  }

  onSuspendClicked() {
    UI.clearBanner();
    const check = this.controller.canSuspend(this.id);
    if (!check.success) { this.displayError(check); return; }
    this.openDialog();
  }

  onConfirm() {
    this.closeDialog();
    const result = this.controller.suspendUserAccount(this.id);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  openDialog() {
    this.lastFocus = document.activeElement;
    this.modal.hidden = false;
    UI.el('confirm-cancel').focus();
  }

  closeDialog() {
    this.modal.hidden = true;
    if (this.lastFocus) this.lastFocus.focus();
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }

  displaySuccess(result) {
    this.show(result.account);
    UI.showBanner('success',
      `${UI.escape(result.message)} — ${UI.escape(result.account.getUsername())} is now Inactive.
       <a href="user-accounts.html?id=${encodeURIComponent(result.account.getId())}">Back to User Accounts</a>`);
  }
}

Layout.start(() => new SuspendUserAccountPage().displayPage());
