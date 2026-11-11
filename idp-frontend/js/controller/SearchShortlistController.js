/*
 * Search Shortlist
 * SearchShortlistPage → SearchShortlistController.searchShortlist(accountId, term) → Shortlist, Project
 * Alternate: "Please enter a search term."; "No matching saved projects found."
 */
class SearchShortlistController {
  searchShortlist(accountId, term) {
    term = String(term ?? '').trim();
    if (term === '') return Result.fieldError('term', 'Please enter a search term.');

    const all = Shortlist.findByAccountId(accountId).map(s => s.toCard());
    const items = all.filter(i => i.project && i.project.matches(term));

    if (!items.length) {
      return Result.fail('No matching saved projects found.', {}, { items: [], term, total: all.length });
    }
    return Result.ok('', { items, term, total: all.length });
  }
}
