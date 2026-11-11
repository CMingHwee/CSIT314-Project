/*
 * Create User Profile
 * CreateUserProfilePage → CreateUserProfileController.createUserProfile(...) → UserProfile
 */
class CreateUserProfileController {
  // Only accounts that do not have a profile yet can be picked.
  getAccountsWithoutProfile() {
    const withProfile = new Set(UserProfile.findAll().map(p => p.getAccountId()));
    return UserAccount.findAll().filter(a => !withProfile.has(a.getId()));
  }

  createUserProfile(accountId, firstName, lastName, address, companyName = '', companyRegNo = '') {
    accountId = String(accountId ?? '').trim();
    firstName = String(firstName ?? '').trim();
    lastName = String(lastName ?? '').trim();
    address = String(address ?? '').trim();
    companyName = String(companyName ?? '').trim();
    companyRegNo = String(companyRegNo ?? '').trim();

    const empty = Object.entries({ accountId, firstName, lastName, address })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    const account = UserAccount.findById(accountId);
    if (!account) return Result.fieldError('accountId', 'Please select a valid user account.');

    // Alternate flow: profile already exists
    if (UserProfile.findByAccountId(accountId)) {
      return Result.fieldError('accountId', 'Profile already exists for this user.');
    }

    const profile = new UserProfile({
      accountId, firstName, lastName, address, companyName, companyRegNo
    }).save();

    ActivityLog.record('User Admin', 'Created profile', account.getUsername());
    return Result.ok('Profile Created Successfully', { profile, account });
  }
}
