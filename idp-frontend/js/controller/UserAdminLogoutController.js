/*
 * User Admin Log Out
 * Sidebar "Log out" → UserAdminLogoutController.logout() → Session
 * Normal flow: end and clear the session → Admin Portal login page (no confirmation step)
 * Alternate:   "Logout failed. Please try again."; an expired session goes to the login page
 *              with "Session expired. Please log in again." (handled by Layout on every page)
 */
class UserAdminLogoutController {
  static LOGIN_PAGE = 'admin-login.html';

  logout() {
    if (!Session.end()) return Result.fail('Logout failed. Please try again.');
    return Result.ok('You have been logged out.', { redirect: UserAdminLogoutController.LOGIN_PAGE });
  }
}
