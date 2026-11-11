/*
 * Search Current IDP
 * CurrentIDPsPage → SearchCurrentIDPController.searchCurrentIDP(accountId, query) → Project
 * Normal flow: "Search IDP" → query → Search → matching current IDPs
 * Alternate:   "Please enter a search query."; "No matching IDP found."
 * Searches the designer's own current IDPs: name, customer, description and specifications.
 */
class SearchCurrentIDPController {
  // The Current IDPs list shown before any search (also where Create Current IDP lands after creating one).
  getCurrentIDPs(accountId) {
    const items = Project.findByAccountAndStatus(accountId, Project.CURRENT);
    const hasCompany = CompanyInfo.findByAccountId(accountId) !== null;
    if (!items.length) return Result.fail('You have no current IDPs yet.', {}, { items, hasCompany });
    return Result.ok('', { items, hasCompany });
  }

  searchCurrentIDP(accountId, query) {
    query = String(query ?? '').trim();
    if (query === '') return Result.fieldError('query', 'Please enter a search query.');

    const all = Project.findByAccountAndStatus(accountId, Project.CURRENT);
    const items = all.filter(p => p.matchesForDesigner(query));
    if (!items.length) return Result.fail('No matching IDP found.', {}, { items: [], query, total: all.length });
    return Result.ok('', { items, query, total: all.length });
  }
}
