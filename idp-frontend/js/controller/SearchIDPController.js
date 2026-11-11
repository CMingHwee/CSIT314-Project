/*
 * Search IDP
 * SearchIDPPage → SearchIDPController.searchIDP(term) → Project
 * Only projects visible to customers are searched (designer has company info and is active).
 */
class SearchIDPController {
  // Shown on the Browse Projects page before any search (the Customer Dashboard).
  getFeaturedProjects() {
    return Result.ok('', { items: Project.findVisible().map(p => p.toCard()) });
  }

  searchIDP(term) {
    term = String(term ?? '').trim();
    if (term === '') return Result.fieldError('term', 'Please enter a search term.');

    const items = Project.findVisible().filter(p => p.matches(term)).map(p => p.toCard());
    if (!items.length) return Result.fail('No IDP found.', {}, { items: [], term });
    return Result.ok('', { items, term });
  }
}
