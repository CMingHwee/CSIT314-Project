/*
 * Update IDP Category
 * UpdateCategoryPage → UpdateCategoryController.updateCategory(id, name, description) → Category
 * Alternate: "Please fill in all required fields."; "Category with this name already exists."
 */
class UpdateCategoryController {
  getCategory(id) {
    const category = Category.findById(id);
    if (!category) return Result.fail('Category not found. Choose one from IDP Categories.');
    return Result.ok('', { category, projects: category.countProjects() });
  }

  updateCategory(id, name, description) {
    const category = Category.findById(id);
    if (!category) return Result.fail('Category not found. Choose one from IDP Categories.');

    name = String(name ?? '').trim();
    description = String(description ?? '').trim();

    const empty = Object.entries({ name, description })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    if (Category.isNameTaken(name, category.getId())) {
      return Result.fieldError('name', 'Category with this name already exists.');
    }

    category.setName(name);
    category.setDescription(description);
    category.save();
    return Result.ok('Category Updated Successfully', { category });
  }
}
