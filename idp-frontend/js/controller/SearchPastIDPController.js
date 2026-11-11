/*
 * Search Past IDP
 * PastIDPsPage → SearchPastIDPController.searchPastIDP(accountId, query) → Project
 * Normal flow: "Search IDP" → query → matching past IDPs
 * Alternate:   "Please enter a search query."; "No matching IDP found."
 */
class SearchPastIDPController {
  // The Past IDPs (portfolio) list shown before any search.
  getPastIDPs(accountId) {
    const items = Project.findByAccountAndStatus(accountId, Project.PAST);
    if (!items.length) return Result.fail('Your portfolio has no past IDPs yet.', {}, { items });
    return Result.ok('', { items });
  }

  searchPastIDP(accountId, query) {
    query = String(query ?? '').trim();
    if (query === '') return Result.fieldError('query', 'Please enter a search query.');

    const all = Project.findByAccountAndStatus(accountId, Project.PAST);
    const items = all.filter(p => p.matchesForDesigner(query));
    if (!items.length) return Result.fail('No matching IDP found.', {}, { items: [], query, total: all.length });
    return Result.ok('', { items, query, total: all.length });
  }
}
