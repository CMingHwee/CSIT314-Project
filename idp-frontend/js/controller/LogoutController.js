/*
 * Interior Designer Logout, Customer Logout, Platform Management Logout (same flow)
 * LogoutPage (confirmation dialog) → LogoutController.logout() → Session
 */
class LogoutController {
  logout() {
    Session.end();
    return Result.ok('You have been logged out.', { redirect: 'login.html' });
  }
}
