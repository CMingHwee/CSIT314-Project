/*
 * View IDP Categories
 * CategoriesPage → ViewCategoriesController.getCategories() → Category
 * Alternate: "No categories found. Please create one."
 */
class ViewCategoriesController {
  getCategories() {
    const rows = Category.findAll().map(c => ({ category: c, projects: c.countProjects() }));
    if (!rows.length) return Result.fail('No categories found. Please create one.', {}, { rows: [] });
    return Result.ok('', { rows });
  }
}
