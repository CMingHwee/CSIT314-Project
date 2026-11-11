/*
 * Search Company Information
 * SearchCompanyInfoPage → SearchCompanyInfoController.searchCompanyInfo(accountId, term) → CompanyInfo
 * Searches within the designer's own company details and reports which fields match.
 */
class SearchCompanyInfoController {
  searchCompanyInfo(accountId, term) {
    term = String(term ?? '').trim();
    if (term === '') return Result.fieldError('term', 'Please enter a search term.');

    const company = CompanyInfo.findByAccountId(accountId);
    if (!company) return Result.fail('No company information found. Please create a profile.');

    const matches = company.matchingFields(term);
    if (!matches.length) {
      return Result.fail('No matching details found in your profile.', {}, { company, term, matches: [] });
    }
    return Result.ok('', { company, term, matches });
  }
}
