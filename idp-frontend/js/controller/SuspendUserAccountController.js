/*
 * Suspend User Account
 * SuspendUserAccountPage → SuspendUserAccountController.suspendUserAccount(id) → UserAccount
 */
class SuspendUserAccountController {
  getUserAccount(id) {
    const account = UserAccount.findById(id);
    if (!account) return Result.fail('Account not found. Select an account from User Accounts first.');
    return Result.ok('', { account });
  }

  // Checked before the confirmation dialog opens.
  canSuspend(id) {
    const account = UserAccount.findById(id);
    if (!account) return Result.fail('Account not found.');
    if (!account.isActive()) return Result.fail('Account is already suspended.', {}, { account });
    return Result.ok('', { account });
  }

  suspendUserAccount(id) {
    const check = this.canSuspend(id);
    if (!check.success) return check;
    const account = check.account.suspend();   // status → Inactive, data kept
    ActivityLog.record('User Admin', 'Suspended account', `${account.getUsername()} (${account.getRole()})`);
    return Result.ok('Account Suspended Successfully', { account });
  }
}
