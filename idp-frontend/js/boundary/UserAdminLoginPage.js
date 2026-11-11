/*
 * Boundary: UserAdminLoginPage — the Admin Portal login.
 * Normal flow: username + password → Login → admin dashboard
 * Alternate:   "Please enter your username and password."; "Invalid username or password."
 */
class UserAdminLoginPage {
  constructor() {
    this.controller = new UserAdminLoginController();
    this.form = UI.el('login-form');
  }

  displayPage() {
    // Already signed in as a User Admin in this tab → straight to the dashboard.
    const s = Session.current();
    if (s && s.role === 'User Admin' && Session.check().status === 'active') {
      location.replace(UserAdminLoginController.DASHBOARD);
      return;
    }
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('username').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.login(v.username, v.password);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
    UI.showFieldErrors(this.form, result.fields);
    UI.el('password').value = '';
    if (!result.fields.username) UI.el('password').focus();
  }

  displaySuccess(result) {
    location.href = result.dashboard;
  }
}

Layout.start(() => new UserAdminLoginPage().displayPage());
