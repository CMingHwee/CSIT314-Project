/*
 * Boundary: CreateUserAccountPage
 * displayPage() → shows the form
 * displayError() → inline errors / "Please fill in all required fields."
 * displaySuccess() → "Account Created"
 */
class CreateUserAccountPage {
  constructor() {
    this.controller = new CreateUserAccountController();
    this.form = UI.el('create-account-form');
  }

  displayPage() {
    UI.el('role').innerHTML = UI.roleOptions(this.controller.getRoles());
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('username').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.createUserAccount(v.username, v.password, v.email, v.phone, v.role);

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
    const a = result.account;
    UI.showBanner('success',
      `${UI.escape(result.message)} — ${UI.escape(a.getUsername())} (${UI.escape(a.getRole())}).
       <a href="user-accounts.html?id=${encodeURIComponent(a.getId())}">View account</a>`);
    this.form.reset();
    UI.el('username').focus();
  }
}

Layout.start(() => new CreateUserAccountPage().displayPage());
