/*
 * Search User Accounts
 * SearchUserAccountPage → SearchUserAccountController.searchUserAccounts(field, term) → UserAccount
 */
class SearchUserAccountController {
  static FIELDS = [
    { value: 'all', label: 'All fields' },
    { value: 'username', label: 'Username' },
    { value: 'email', label: 'Email' },
    { value: 'role', label: 'Role' }
  ];

  searchUserAccounts(field, term) {
    term = String(term ?? '').trim();
    if (term === '') return Result.fieldError('term', 'Please enter a search term.');

    const results = UserAccount.search(field, term);
    if (!results.length) return Result.fail('No users found.', {}, { results: [], term });
    return Result.ok('', { results, term });
  }
}
