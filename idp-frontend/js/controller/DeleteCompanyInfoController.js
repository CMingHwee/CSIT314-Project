/*
 * Delete Company Information
 * DeleteCompanyInfoPage (confirmation dialog) → DeleteCompanyInfoController.deleteCompanyInfo(accountId) → CompanyInfo
 *
 * The designer's projects are not deleted. They are hidden from customers
 * for as long as the designer has no company information.
 */
class DeleteCompanyInfoController {
  deleteCompanyInfo(accountId) {
    const company = CompanyInfo.findByAccountId(accountId);
    if (!company) return Result.fail('No company information found.');

    if (!company.delete()) {
      return Result.fail('Failed to delete company information. Please try again.');
    }
    ActivityLog.record('Interior Designer', 'Deleted company info', company.getCompanyName());
    return Result.ok('Company Information Deleted Successfully', { redirect: 'designer-dashboard.html' });
  }
}
