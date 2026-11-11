/*
 * Boundary: SearchUserAccountPage
 * Normal flow: enter a term → Search → matching accounts listed (Username, Email, Phone, Role, Status)
 * Alternate:   "Please enter a search term."; "No users found."
 */
class SearchUserAccountPage {
  constructor() {
    this.controller = new SearchUserAccountController();
    this.form = UI.el('search-form');
  }

  displayPage() {
    UI.el('field').innerHTML = SearchUserAccountController.FIELDS
      .map(f => `<option value="${f.value}">${f.label}</option>`).join('');

    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('clear-btn').addEventListener('click', () => this.clear());

    // Allows links such as search-accounts.html?field=role&q=Customer
    const q = UI.param('q');
    if (q) {
      UI.el('field').value = UI.param('field') || 'all';
      UI.el('term').value = q;
      this.search();
    } else {
      UI.el('term').focus();
    }
  }

  onSubmit(e) {
    e.preventDefault();
    this.search();
  }

  search() {
    UI.clearFieldErrors(this.form);
    const { field, term } = UI.formValues(this.form);
    const result = this.controller.searchUserAccounts(field, term);

    if (result.success) {
      this.displayResults(result);
    } else if (result.fields.term) {
      UI.el('results-card').hidden = true;
      UI.showFieldErrors(this.form, result.fields);
    } else {
      this.displayResults(result);   // "No users found."
    }

    const url = result.term ? `?field=${encodeURIComponent(field)}&q=${encodeURIComponent(result.term)}` : location.pathname;
    history.replaceState(null, '', url);
  }

  displayResults(result) {
    const n = result.results.length;
    UI.el('results-title').textContent =
      n ? `${n} account${n === 1 ? '' : 's'} match “${result.term}”` : `0 accounts match “${result.term}”`;

    const field = UI.el('field').value;
    const hl = (name, text) => (field === 'all' || field === name) ? UI.highlight(text, result.term) : UI.escape(text);

    UI.el('results-body').innerHTML = n
      ? result.results.map(a => `
        <tr>
          <td>${hl('username', a.getUsername())}</td>
          <td>${hl('email', a.getEmail())}</td>
          <td>${UI.escape(a.getPhone()) || '—'}</td>
          <td>${hl('role', a.getRole())}</td>
          <td>${UI.statusPill(a.getStatus())}</td>
          <td><a href="user-accounts.html?id=${encodeURIComponent(a.getId())}">View</a></td>
        </tr>`).join('')
      : `<tr><td colspan="6" class="empty">${UI.escape(result.message)}</td></tr>`;

    UI.el('results-card').hidden = false;
  }

  clear() {
    this.form.reset();
    UI.clearFieldErrors(this.form);
    UI.el('results-card').hidden = true;
    history.replaceState(null, '', location.pathname);
    UI.el('term').focus();
  }
}

Layout.start(() => new SearchUserAccountPage().displayPage());
