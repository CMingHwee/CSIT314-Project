/*
 * Create User Account
 * CreateUserAccountPage → CreateUserAccountController.createUserAccount(...) → UserAccount
 */
class CreateUserAccountController {
  getRoles() {
    return UserAccount.ROLES;
  }

  createUserAccount(username, password, email, phone, role) {
    username = String(username ?? '').trim();
    email = String(email ?? '').trim();
    phone = String(phone ?? '').trim();
    password = String(password ?? '');
    role = String(role ?? '');

    const empty = Object.entries({ username, email, password, role })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    if (!Validation.isEmail(email)) return Result.fieldError('email', 'Please enter a valid email address.');
    if (phone && !Validation.isPhone(phone)) return Result.fieldError('phone', 'Enter an 8-digit Singapore number.');
    if (!UserAccount.ROLES.includes(role)) return Result.fieldError('role', 'Please select a valid role.');

    // Alternate flow: user already exists
    const conflict = UserAccount.findConflict(username, email);
    if (conflict) return Result.fieldError(conflict, 'This username or email already exists.');

    if (!Validation.isStrongPassword(password)) return Result.fieldError('password', 'Password too weak.');

    const account = new UserAccount({
      username,
      email,
      phone: Validation.normalizePhone(phone),
      password,
      role,
      status: UserAccount.ACTIVE
    }).save();

    ActivityLog.record('User Admin', 'Created account', `${account.getUsername()} (${account.getRole()})`);
    return Result.ok('Account Created', { account });
  }
}
