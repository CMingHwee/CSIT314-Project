/*
 * Boundary: LoginPage
 * Normal flow: choose role → email + password → Login → role's dashboard
 * Alternate:   "Invalid credentials."; "Your account has been suspended."
 */
class LoginPage {
  constructor() {
    this.controller = new LoginController();
    this.form = UI.el('login-form');
  }

  displayPage() {
    UI.el('role').innerHTML = `<option value="">Select your role…</option>` +
      this.controller.getRoles().map(r => `<option value="${UI.escape(r)}">${UI.escape(r)}</option>`).join('');

    // Remember the last role picked on this tab, to save a click.
    try { UI.el('role').value = sessionStorage.getItem('idp.lastRole') || ''; } catch { /* ignore */ }

    // From the homepage: login.html?role=Customer&next=project.html%3Fid%3D2
    const role = UI.param('role');
    if (role && this.controller.getRoles().includes(role)) UI.el('role').value = role;
    this.next = LoginPage.safeNext(UI.param('next'));
    if (this.next) {
      UI.showBanner('info', 'Log in to see this project — you’ll go straight to it.');
    }

    this.form.addEventListener('submit', e => this.onSubmit(e));
    (UI.el('role').value ? UI.el('email') : UI.el('role')).focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    try { sessionStorage.setItem('idp.lastRole', v.role); } catch { /* ignore */ }

    const result = this.controller.login(v.role, v.email, v.password);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
    UI.showFieldErrors(this.form, result.fields);
    UI.el('password').value = '';
    if (!Object.keys(result.fields).length) UI.el('password').focus();
  }

  displaySuccess(result) {
    // Back to the page that sent the user here (only customer pages can show a project).
    if (this.next && result.account.getRole() === 'Customer') {
      location.href = this.next;
      return;
    }
    if (result.dashboard) {
      location.href = result.dashboard;
      return;
    }
    // Fallback: a role with no dashboard configured in LoginController.DASHBOARDS.
    Session.end();
    UI.showBanner('info',
      `Credentials accepted for <strong>${UI.escape(result.account.getUsername())}</strong>, ` +
      `but the ${UI.escape(result.account.getRole())} dashboard hasn't been built yet.`);
  }
}

// Only same-site pages like "project.html?id=2" are accepted as a destination.
LoginPage.safeNext = next => (/^[a-z0-9-]+\.html(\?[\w=&%.-]*)?$/i.test(String(next || '')) ? next : '');

Layout.start(() => new LoginPage().displayPage());
