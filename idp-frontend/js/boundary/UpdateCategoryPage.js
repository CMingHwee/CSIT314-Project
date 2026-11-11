/*
 * Boundary: UpdateCategoryPage. Opened as update-category.html?id=<category id>.
 * Normal flow: current details → edit name/description → Save → "Category Updated Successfully"
 * Alternate:   "Please fill in all required fields."; "Category with this name already exists."; Cancel
 */
class UpdateCategoryPage {
  constructor() {
    this.controller = new UpdateCategoryController();
    this.form = UI.el('category-form');
    this.id = UI.param('id');
  }

  displayPage() {
    const result = this.controller.getCategory(this.id);
    if (!result.success) {
      UI.el('crumb-name').textContent = 'Not found';
      UI.showBanner('error', `${UI.escape(result.message)} <a href="categories.html">Go to IDP Categories</a>`);
      return;
    }
    const c = result.category;
    UI.el('crumb-name').textContent = c.getName();
    UI.el('current-strip').innerHTML =
      `<strong>Current:</strong> ${UI.escape(c.getName())} — “${UI.escape(c.getDescription())}” · ` +
      `used by ${UI.num(result.projects)} IDP${result.projects === 1 ? '' : 's'}`;
    UI.el('name').value = c.getName();
    UI.el('description').value = c.getDescription();

    this.form.hidden = false;
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('name').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.updateCategory(this.id, v.name, v.description);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (!Object.keys(result.fields).length) {
      UI.showBanner('error', UI.escape(result.message));
      return;
    }
    // As in the wireframe: "Please fill in all required fields." under the empty field.
    const fields = { ...result.fields };
    if (result.message === 'Please fill in all required fields.') {
      for (const k of Object.keys(fields)) fields[k] = result.message;
    }
    UI.showFieldErrors(this.form, fields);
  }

  displaySuccess(result) {
    UI.setFlash('success', `${result.message} — “${result.category.getName()}”.`);
    location.href = 'categories.html';
  }
}

Layout.start(() => new UpdateCategoryPage().displayPage());
