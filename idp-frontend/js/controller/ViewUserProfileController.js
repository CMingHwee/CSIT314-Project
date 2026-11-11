/*
 * View User Profile
 * UserProfilesPage → ViewUserProfileController → UserProfile, UserAccount
 * Normal flow: select a profile → "View Profile" → personal and professional details
 * Alternate:   "Profile not found for this user."
 */
class ViewUserProfileController {
  // Every profile with its account, for the All Profiles table.
  getUserProfiles() {
    const rows = UserProfile.findAll().map(profile => ({ profile, account: profile.getAccount() }));
    if (!rows.length) return Result.fail('No profiles found. Create one to get started.', {}, { rows: [] });
    return Result.ok('', { rows });
  }

  getUserProfile(profileId) {
    const profile = UserProfile.findById(profileId);
    if (!profile) return Result.fail('Profile not found for this user.');
    return Result.ok('', { profile, account: profile.getAccount() });
  }

  // Opened from an account (User Accounts → View Profile); the account may not have a profile yet.
  getProfileForAccount(accountId) {
    const account = UserAccount.findById(accountId);
    const profile = account ? UserProfile.findByAccountId(accountId) : null;
    if (!profile) return Result.fail('Profile not found for this user.', {}, { account });
    return Result.ok('', { profile, account });
  }
}
