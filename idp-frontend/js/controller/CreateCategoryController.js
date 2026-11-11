/*
 * Create IDP Category
 * CreateCategoryPage → CreateCategoryController.createCategory(name, description) → Category
 */
class CreateCategoryController {
  createCategory(name, description) {
    name = String(name ?? '').trim();
    description = String(description ?? '').trim();

    const empty = Object.entries({ name, description })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    // Duplicate check
    if (Category.isNameTaken(name)) return Result.fieldError('name', 'Category with this name already exists.');

    const category = new Category({ name, description }).save();
    return Result.ok('Category Created Successfully', { category });
  }
}
