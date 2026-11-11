/*
 * View Company Information
 * ViewCompanyInfoPage → ViewCompanyInfoController.getCompanyInfo(accountId) → CompanyInfo
 */
class ViewCompanyInfoController {
  getCompanyInfo(accountId) {
    const company = CompanyInfo.findByAccountId(accountId);
    if (!company) return Result.fail('No company information found. Please create a profile.');
    return Result.ok('', { company });
  }
}
