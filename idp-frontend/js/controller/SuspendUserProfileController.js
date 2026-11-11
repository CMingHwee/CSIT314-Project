/*
 * Suspend User Profile
 * SuspendUserProfilePage → SuspendUserProfileController.suspendUserProfile(profileId) → UserProfile
 * Normal flow: select an Active profile → "Suspend Profile" → confirm → status "Suspended"
 *              (hidden from public search) → "Profile Suspended Successfully"
 * Alternate:   "Profile is already suspended."; Cancel
 * This does not stop the user logging in — that is suspending the account.
 */
class SuspendUserProfileController {
  getUserProfile(profileId) {
    const profile = UserProfile.findById(profileId);
    if (!profile) return Result.fail('Profile not found for this user.');
    return Result.ok('', { profile, account: profile.getAccount() });
  }

  // Checked before the confirmation dialog opens, and again on confirm.
  canSuspend(profileId) {
    const profile = UserProfile.findById(profileId);
    if (!profile) return Result.fail('Profile not found for this user.');
    if (profile.isSuspended()) return Result.fail('Profile is already suspended.', {}, { profile });
    return Result.ok('', { profile, account: profile.getAccount() });
  }

  suspendUserProfile(profileId) {
    const check = this.canSuspend(profileId);
    if (!check.success) return check;
    const profile = check.profile.suspend();
    ActivityLog.record('User Admin', 'Suspended profile', check.account ? check.account.getUsername() : profile.getFullName());
    return Result.ok('Profile Suspended Successfully', { profile, account: check.account });
  }
}
