/*
 * View User Account
 * UserAccountsPage → ViewUserAccountController → UserAccount
 */
class ViewUserAccountController {
  getUserAccounts() {
    const accounts = UserAccount.findAll();
    if (!accounts.length) return Result.fail('No users found.', {}, { accounts: [] });
    return Result.ok('', { accounts });
  }

  getUserAccount(id) {
    const account = UserAccount.findById(id);
    if (!account) return Result.fail('Account not found. Select an account from the list.');
    return Result.ok('', { account });
  }
}
