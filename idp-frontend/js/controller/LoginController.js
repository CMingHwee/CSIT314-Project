/*
 * Interior Designer Login, Customer Login, Platform Management Login
 * One Login Page serves every role (the role is picked from a dropdown),
 * User Admins have their own Admin Portal login with a username (UserAdminLoginController).
 * LoginPage → LoginController.login(role, email, password) → UserAccount, Session
 */
class LoginController {
  // Where each role lands after logging in. null = that dashboard is not built yet.
  static DASHBOARDS = {
    'Interior Designer': 'designer-dashboard.html',
    'User Admin': 'admin-dashboard.html',
    'Customer': 'browse-projects.html',
    'Platform Management': 'pm-dashboard.html'
  };

  // User Admins sign in through the Admin Portal with their username instead.
  getRoles() {
    return UserAccount.ROLES.filter(r => r !== 'User Admin');
  }

  login(role, email, password) {
    role = String(role ?? '');
    email = String(email ?? '').trim();
    password = String(password ?? '');

    const empty = Object.entries({ role, email, password })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    // Verify credentials. The message does not say which part was wrong, on purpose.
    const account = UserAccount.findByEmail(email);
    if (!account || account.getPassword() !== password || account.getRole() !== role) {
      return Result.fail('Invalid credentials.');
    }

    // Check the account is active
    if (!account.isActive()) return Result.fail('Your account has been suspended.');

    Session.start(account);
    return Result.ok('Login successful', {
      account,
      dashboard: LoginController.DASHBOARDS[role] ?? null
    });
  }
}
