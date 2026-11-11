/*
 * Boundary: CreateCategoryPage
 * Normal flow: Create New Category → Name + Description → Save → duplicate check
 *              → "Category Created Successfully" → IDP Categories
 * Alternate:   required fields; "Category with this name already exists."; Cancel
 */
class CreateCategoryPage {
  constructor() {
    this.controller = new CreateCategoryController();
    this.form = UI.el('category-form');
  }

  displayPage() {
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('name').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.createCategory(v.name, v.description);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (result.message === 'Please fill in all required fields.') UI.showBanner('error', UI.escape(result.message));
    UI.showFieldErrors(this.form, result.fields);
  }

  displaySuccess(result) {
    UI.setFlash('success', `${result.message} — “${result.category.getName()}”.`);
    location.href = 'categories.html';
  }
}

Layout.start(() => new CreateCategoryPage().displayPage());
