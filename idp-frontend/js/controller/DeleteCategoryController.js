/*
 * Delete IDP Category
 * DeleteCategoryPage (confirmation dialog) → DeleteCategoryController.deleteCategory(id) → Category, Project
 * Alternate: Cancel; "Cannot delete category. It is currently assigned to existing IDPs."
 */
class DeleteCategoryController {
  // Checked before the confirmation dialog opens, and again on delete.
  canDelete(id) {
    const category = Category.findById(id);
    if (!category) return Result.fail('Category not found.');
    if (category.countProjects() > 0) {
      return Result.fail('Cannot delete category. It is currently assigned to existing IDPs.', {}, { category });
    }
    return Result.ok('', { category });
  }

  deleteCategory(id) {
    const check = this.canDelete(id);
    if (!check.success) return check;
    check.category.delete();
    return Result.ok('Category Deleted Successfully', { category: check.category });
  }
}
