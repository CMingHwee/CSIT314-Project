/*
 * Boundary: SearchCategoryPage
 * Normal flow: enter a term → Search → matching categories
 * Alternate:   "Please enter a search term."; "No categories found matching your query."
 */
class SearchCategoryPage {
  constructor(viewPage) {
    this.view = viewPage;
    this.controller = new SearchCategoryController();
    this.form = UI.el('search-form');
    this.term = '';
  }

  displayPage() {
    this.form.addEventListener('submit', e => { e.preventDefault(); this.run(UI.el('term').value); });
    UI.el('clear-search').addEventListener('click', () => this.clear());
  }

  isActive() {
    return this.term !== '';
  }

  run(term = this.term) {
    UI.clearFieldErrors(this.form);
    const result = this.controller.searchCategories(term);

    if (result.fields.term) {
      UI.showFieldErrors(this.form, result.fields);
      return;
    }
    this.term = result.term;
    UI.el('clear-search').hidden = false;

    if (!result.success) {
      // "No categories found matching your query."
      UI.el('list-title').textContent = `0 categories match “${result.term}”`;
      UI.el('categories-body').innerHTML = `<tr><td colspan="4" class="empty">${UI.escape(result.message)}</td></tr>`;
      return;
    }
    const n = result.rows.length;
    UI.el('list-title').textContent = `${n} categor${n === 1 ? 'y' : 'ies'} match “${result.term}”`;
    this.view.renderRows(result.rows, result.term);
  }

  clear() {
    this.term = '';
    this.form.reset();
    UI.clearFieldErrors(this.form);
    this.view.displayPage();
    UI.el('term').focus();
  }
}
