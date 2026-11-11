/*
 * Update User Account
 * UpdateUserAccountPage → UpdateUserAccountController.updateUserAccount(...) → UserAccount
 */
class UpdateUserAccountController {
  getRoles() {
    return UserAccount.ROLES;
  }

  getUserAccount(id) {
    const account = UserAccount.findById(id);
    if (!account) return Result.fail('Account not found. Select an account from User Accounts first.');
    return Result.ok('', { account });
  }

  // Leave newPassword and confirmPassword blank to keep the current password.
  updateUserAccount(id, username, email, phone, role, newPassword = '', confirmPassword = '') {
    const account = UserAccount.findById(id);
    if (!account) return Result.fail('Account not found. Select an account from User Accounts first.');

    username = String(username ?? '').trim();
    email = String(email ?? '').trim();
    phone = String(phone ?? '').trim();
    role = String(role ?? '');
    newPassword = String(newPassword ?? '');
    confirmPassword = String(confirmPassword ?? '');

    const empty = Object.entries({ username, email, role })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    if (!Validation.isEmail(email)) return Result.fieldError('email', 'Please enter a valid email address.');
    if (phone && !Validation.isPhone(phone)) return Result.fieldError('phone', 'Enter an 8-digit Singapore number.');
    if (!UserAccount.ROLES.includes(role)) return Result.fieldError('role', 'Please select a valid role.');

    // Alternate flow: username/email already used by another account
    const conflict = UserAccount.findConflict(username, email, account.getId());
    if (conflict) return Result.fieldError(conflict, 'Username/email already in use.');

    // Alternate flow: password reset
    const resettingPassword = newPassword !== '' || confirmPassword !== '';
    if (resettingPassword) {
      if (!Validation.isStrongPassword(newPassword)) return Result.fieldError('newPassword', 'Password too weak.');
      if (newPassword !== confirmPassword) return Result.fieldError('confirmPassword', 'Passwords do not match.');
    }

    account.setUsername(username);
    account.setEmail(email);
    account.setPhone(Validation.normalizePhone(phone));
    account.setRole(role);
    if (resettingPassword) account.setPassword(newPassword);
    account.save();

    ActivityLog.record('User Admin', 'Updated account', `${account.getUsername()} (${account.getRole()})`);
    return Result.ok('Account Updated Successfully', { account, passwordChanged: resettingPassword });
  }
}
