/*
 * Boundary: SuspendUserProfilePage. Opened as suspend-profile.html?id=<profile id>.
 * Normal flow: Suspend Profile → confirm → status Suspended → "Profile Suspended Successfully"
 * Alternate:   Cancel; "Profile is already suspended."
 */
class SuspendUserProfilePage {
  constructor() {
    this.controller = new SuspendUserProfileController();
    this.id = UI.param('id');
    this.modal = UI.el('confirm-modal');
    this.lastFocus = null;
  }

  displayPage() {
    const result = this.controller.getUserProfile(this.id);
    if (!result.success) {
      UI.el('crumb-user').textContent = 'Not found';
      UI.showBanner('error', `${UI.escape(result.message)} <a href="user-profiles.html">Go to User Profiles</a>`);
      return;
    }
    this.show(result.profile, result.account);
    UI.el('profile-card').hidden = false;

    UI.el('suspend-btn').addEventListener('click', () => this.onSuspendClicked());
    UI.el('confirm-cancel').addEventListener('click', () => this.closeDialog());
    UI.el('confirm-yes').addEventListener('click', () => this.onConfirm());
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.closeDialog(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !this.modal.hidden) this.closeDialog(); });
  }

  show(p, a) {
    const username = a ? a.getUsername() : p.getFullName();
    UI.el('crumb-user').textContent = username;
    UI.el('profile-title').innerHTML =
      `Profile · ${UI.escape(username)}${a ? ` (${UI.escape(a.getRole())})` : ''} &nbsp;${UI.statusPill(p.getStatus())}`;
    UI.el('p-first').textContent = p.getFirstName();
    UI.el('p-last').textContent = p.getLastName();
    UI.el('p-address').textContent = p.getAddress();
    UI.el('p-company').textContent = p.getCompanyName() || '—';
    UI.el('p-account').innerHTML = a ? UI.statusPill(a.getStatus()) : '—';
    UI.el('back-link').href = `user-profiles.html?id=${encodeURIComponent(p.getId())}`;
    UI.el('confirm-title').textContent = `Suspend ${username}'s profile?`;
  }

  onSuspendClicked() {
    UI.clearBanner();
    const check = this.controller.canSuspend(this.id);
    if (!check.success) { this.displayError(check); return; }
    this.lastFocus = document.activeElement;
    this.modal.hidden = false;
    UI.el('confirm-cancel').focus();
  }

  closeDialog() {
    this.modal.hidden = true;
    if (this.lastFocus) this.lastFocus.focus();
  }

  onConfirm() {
    this.closeDialog();
    const result = this.controller.suspendUserProfile(this.id);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }

  displaySuccess(result) {
    this.show(result.profile, result.account);
    UI.showBanner('success',
      `${UI.escape(result.message)} — the profile is now hidden from public search. ` +
      `<a href="user-profiles.html?id=${encodeURIComponent(result.profile.getId())}">Back to User Profiles</a>`);
  }
}

Layout.start(() => new SuspendUserProfilePage().displayPage());
