/*
 * User Admin Log In (Admin Portal)
 * UserAdminLoginPage → UserAdminLoginController.login(username, password) → UserAccount, Session
 * Normal flow: username + password → Login → verify → session → admin dashboard
 * Alternate:   "Please enter your username and password."; "Invalid username or password."
 * A suspended (Inactive) admin account is refused too, as on the other login.
 */
class UserAdminLoginController {
  static DASHBOARD = 'admin-dashboard.html';

  login(username, password) {
    username = String(username ?? '').trim();
    password = String(password ?? '');

    if (username === '' || password === '') {
      const fields = {};
      if (username === '') fields.username = '';
      if (password === '') fields.password = '';
      return Result.fail('Please enter your username and password.', fields);
    }

    const u = username.toLowerCase();
    const account = UserAccount.findAll().find(a => a.getUsername().toLowerCase() === u);
    if (!account || account.getRole() !== 'User Admin' || account.getPassword() !== password) {
      return Result.fail('Invalid username or password.', { username: '', password: '' });
    }
    if (!account.isActive()) return Result.fail('Your account has been suspended.');

    Session.start(account);
    return Result.ok('Login successful', { account, dashboard: UserAdminLoginController.DASHBOARD });
  }
}
