/*
 * Search User Profiles
 * SearchUserProfilePage → SearchUserProfileController.searchUserProfiles(by, term) → UserProfile
 * Normal flow: "Search Profiles" → company name or location → Search → matching profiles
 * Alternate:   "Please enter a company name or location."; "No matching profiles found."
 */
class SearchUserProfileController {
  static BY = [
    { value: 'company', label: 'Company Name' },
    { value: 'location', label: 'Location' }
  ];

  searchUserProfiles(by, term) {
    by = by === 'location' ? 'location' : 'company';
    term = String(term ?? '').trim();
    if (term === '') return Result.fieldError('term', 'Please enter a company name or location.');

    const rows = UserProfile.search(by, term).map(profile => ({ profile, account: profile.getAccount() }));
    if (!rows.length) return Result.fail('No matching profiles found.', {}, { rows: [], by, term });
    return Result.ok('', { rows, by, term });
  }
}
