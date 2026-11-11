/*
 * Boundary: CreateUserProfilePage
 * Normal flow: pick account → First Name, Last Name, Address, company details → Save
 *              → "Profile Created Successfully"
 * Alternate:   "Please fill in all required fields."; "Profile already exists for this user."; Cancel
 */
class CreateUserProfilePage {
  constructor() {
    this.controller = new CreateUserProfileController();
    this.form = UI.el('create-profile-form');
  }

  displayPage() {
    // ?account=<id> preselects the account (from "Profile not found for this user." on View User Profile)
    this.loadAccounts(UI.param('account') || '');
    this.form.addEventListener('submit', e => this.onSubmit(e));
  }

  loadAccounts(selectedId = '') {
    const accounts = this.controller.getAccountsWithoutProfile();
    const select = UI.el('accountId');
    const none = accounts.length === 0;

    select.innerHTML = none
      ? `<option value="">All accounts already have a profile</option>`
      : `<option value="">Select an account…</option>` + accounts.map(a =>
          `<option value="${UI.escape(a.getId())}"${a.getId() === selectedId ? ' selected' : ''}>` +
          `${UI.escape(a.getUsername())} · ${UI.escape(a.getRole())}</option>`).join('');

    select.disabled = none;
    UI.el('save-btn').disabled = none;
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.createUserProfile(
      v.accountId, v.firstName, v.lastName, v.address, v.companyName, v.companyRegNo);

    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (result.message === 'Please fill in all required fields.') {
      UI.showBanner('error', UI.escape(result.message));
    }
    UI.showFieldErrors(this.form, result.fields);
  }

  displaySuccess(result) {
    UI.showBanner('success',
      `${UI.escape(result.message)} — ${UI.escape(result.profile.getFullName())} ` +
      `(${UI.escape(result.account.getUsername())}). ` +
      `<a href="user-profiles.html?id=${encodeURIComponent(result.profile.getId())}">View profile</a>`);
    this.form.reset();
    this.loadAccounts();
  }
}

Layout.start(() => new CreateUserProfilePage().displayPage());
