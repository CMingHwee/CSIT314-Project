/*
 * Edit User Profile
 * EditUserProfilePage → UpdateUserProfileController.updateUserProfile(...) → UserProfile
 * Normal flow: edit First/Last Name, Address, Company Details → Save → "Profile Updated Successfully"
 * Alternate:   "Please fill in all required fields."; Cancel; "Validation failed."
 */
class UpdateUserProfileController {
  getUserProfile(profileId) {
    const profile = UserProfile.findById(profileId);
    if (!profile) return Result.fail('Profile not found for this user.');
    return Result.ok('', { profile, account: profile.getAccount() });
  }

  updateUserProfile(profileId, firstName, lastName, address, companyName = '', companyRegNo = '') {
    const profile = UserProfile.findById(profileId);
    if (!profile) return Result.fail('Profile not found for this user.');

    firstName = String(firstName ?? '').trim();
    lastName = String(lastName ?? '').trim();
    address = String(address ?? '').trim();
    companyName = String(companyName ?? '').trim();
    companyRegNo = String(companyRegNo ?? '').trim().toUpperCase();

    const empty = Object.entries({ firstName, lastName, address })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    // Alternate flow: validation failed
    if (!Validation.isPersonName(firstName)) {
      return Result.invalid('firstName', 'Names can only contain letters, spaces, hyphens and apostrophes.');
    }
    if (!Validation.isPersonName(lastName)) {
      return Result.invalid('lastName', 'Names can only contain letters, spaces, hyphens and apostrophes.');
    }
    if (companyRegNo && !Validation.isRegistrationNumber(companyRegNo)) {
      return Result.invalid('companyRegNo', 'Use 4–15 letters and numbers only.');
    }
    if (companyRegNo && !companyName) {
      return Result.invalid('companyName', 'Add the company name for this registration number.');
    }

    profile.setFirstName(firstName);
    profile.setLastName(lastName);
    profile.setAddress(address);
    profile.setCompanyName(companyName);
    profile.setCompanyRegNo(companyRegNo);
    profile.save();

    const account = profile.getAccount();
    ActivityLog.record('User Admin', 'Updated profile', account ? account.getUsername() : profile.getFullName());
    return Result.ok('Profile Updated Successfully', { profile, account });
  }
}
