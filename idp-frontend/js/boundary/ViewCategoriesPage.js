/*
 * Boundary: ViewCategoriesPage
 * Lists every category (name, description, number of IDPs) with Edit and Delete.
 * Alternate: "No categories found. Please create one."
 */
class ViewCategoriesPage {
  constructor() {
    this.controller = new ViewCategoriesController();
  }

  displayPage() {
    const result = this.controller.getCategories();
    UI.el('clear-search').hidden = true;
    if (!result.success) {
      this.displayError(result);
      return;
    }
    UI.el('list-title').textContent = `All categories · ${result.rows.length}`;
    this.renderRows(result.rows);
  }

  // Shared with SearchCategoryPage. term highlights matches in the name.
  renderRows(rows, term = '') {
    UI.el('categories-body').innerHTML = rows.map(({ category: c, projects }) => `
      <tr>
        <td><strong>${UI.highlight(c.getName(), term)}</strong></td>
        <td>${UI.escape(c.getDescription())}</td>
        <td>${UI.num(projects)}</td>
        <td style="text-align:right;white-space:nowrap">
          <a href="update-category.html?id=${encodeURIComponent(c.getId())}">Edit</a>
          &nbsp;
          <button type="button" class="link" data-delete="${UI.escape(c.getId())}" data-name="${UI.escape(c.getName())}">Delete</button>
        </td>
      </tr>`).join('');
  }

  displayError(result) {
    UI.el('list-title').textContent = 'All categories · 0';
    UI.el('categories-body').innerHTML = `
      <tr><td colspan="4" class="empty">${UI.escape(result.message)}
        <br><a href="create-category.html">Create New Category</a></td></tr>`;
  }
}
