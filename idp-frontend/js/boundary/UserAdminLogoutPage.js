/*
 * Boundary: UserAdminLogoutPage — the sidebar "Log out" link on User Admin pages.
 * Normal flow: Log out → session ended and cleared → Admin Portal login with "You have been logged out."
 *              (no confirmation step in this use case)
 * Alternate:   "Logout failed. Please try again."
 */
class UserAdminLogoutPage {
  constructor() {
    this.controller = new UserAdminLogoutController();
  }

  displayPage() {
    UI.el('logout-link').addEventListener('click', e => {
      e.preventDefault();
      this.onLogout();
    });
  }

  onLogout() {
    const result = this.controller.logout();
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }

  displaySuccess(result) {
    UI.setFlash('success', result.message);
    location.replace(result.redirect);
  }
}
