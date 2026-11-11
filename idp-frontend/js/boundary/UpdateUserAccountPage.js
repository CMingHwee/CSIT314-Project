/*
 * Boundary: UpdateUserAccountPage
 * Opened as update-account.html?id=<account id> from the User Accounts page.
 */
class UpdateUserAccountPage {
  constructor() {
    this.controller = new UpdateUserAccountController();
    this.form = UI.el('update-account-form');
    this.id = UI.param('id');
  }

  displayPage() {
    const result = this.controller.getUserAccount(this.id);
    if (!result.success) {
      UI.el('crumb-user').textContent = 'Not found';
      UI.showBanner('error', `${UI.escape(result.message)} <a href="user-accounts.html">Go to User Accounts</a>`);
      return;
    }

    this.fill(result.account);
    this.form.hidden = false;
    this.form.addEventListener('submit', e => this.onSubmit(e));
  }

  fill(account) {
    UI.el('username').value = account.getUsername();
    UI.el('email').value = account.getEmail();
    UI.el('phone').value = account.getPhone();
    UI.el('role').innerHTML = UI.roleOptions(this.controller.getRoles(), account.getRole());
    UI.el('newPassword').value = '';
    UI.el('confirmPassword').value = '';

    UI.el('crumb-user').textContent = account.getUsername();
    UI.el('cancel-link').href = `user-accounts.html?id=${encodeURIComponent(account.getId())}`;

    const pill = UI.el('status-pill');
    pill.textContent = `Status: ${account.getStatus()}`;
    pill.classList.toggle('inactive', !account.isActive());
    pill.hidden = false;
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.updateUserAccount(
      this.id, v.username, v.email, v.phone, v.role, v.newPassword, v.confirmPassword);

    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (!Object.keys(result.fields).length || result.message === 'Please fill in all required fields.') {
      UI.showBanner('error', UI.escape(result.message));
    }
    UI.showFieldErrors(this.form, result.fields);
  }

  displaySuccess(result) {
    this.fill(result.account);
    const extra = result.passwordChanged ? ' Password has been reset.' : '';
    UI.showBanner('success',
      `${UI.escape(result.message)}.${extra}
       <a href="user-accounts.html?id=${encodeURIComponent(result.account.getId())}">Back to User Accounts</a>`);
  }
}

Layout.start(() => new UpdateUserAccountPage().displayPage());
