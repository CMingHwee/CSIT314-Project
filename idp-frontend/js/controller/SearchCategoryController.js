/*
 * Search IDP Category
 * SearchCategoryPage → SearchCategoryController.searchCategories(term) → Category
 * Alternate: "Please enter a search term."; "No categories found matching your query."
 */
class SearchCategoryController {
  searchCategories(term) {
    term = String(term ?? '').trim();
    if (term === '') return Result.fieldError('term', 'Please enter a search term.');

    const rows = Category.searchByName(term).map(c => ({ category: c, projects: c.countProjects() }));
    if (!rows.length) return Result.fail('No categories found matching your query.', {}, { rows: [], term });
    return Result.ok('', { rows, term });
  }
}
