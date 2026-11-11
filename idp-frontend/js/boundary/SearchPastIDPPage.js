/*
 * Boundary: SearchPastIDPPage — also the Past IDPs (portfolio) list.
 * Normal flow: query → Search → matching past IDPs ("1 of 3 past IDPs matches …")
 * Alternate:   "Please enter a search query."; "No matching IDP found."
 * ?new=<id> highlights a past IDP just created; ?q=<query> re-runs a search.
 */
class SearchPastIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new SearchPastIDPController();
    this.form = UI.el('search-form');
  }

  displayPage() {
    this.form.addEventListener('submit', e => { e.preventDefault(); this.search(); });
    UI.el('clear-search').addEventListener('click', () => this.clear());

    const q = UI.param('q');
    if (q) {
      UI.el('query').value = q;
      this.search();
    } else {
      this.displayAll();
    }
  }

  displayAll() {
    const result = this.controller.getPastIDPs(this.session.accountId);
    this.setSearchMode(false);
    UI.el('list-title').textContent = `Past IDPs · ${result.items.length}`;
    this.renderRows(result.items, '', result.message);
  }

  search() {
    UI.clearFieldErrors(this.form);
    const result = this.controller.searchPastIDP(this.session.accountId, UI.el('query').value);
    if (result.fields.query) {
      UI.showFieldErrors(this.form, result.fields);
      return;
    }
    history.replaceState(null, '', `?q=${encodeURIComponent(result.query)}`);
    this.setSearchMode(true);
    const n = result.items.length;
    UI.el('list-title').textContent =
      `${n} of ${result.total} past IDP${result.total === 1 ? '' : 's'} match${n === 1 ? 'es' : ''} “${result.query}”`;
    this.renderRows(result.items, result.query, result.message);
  }

  setSearchMode(on) {
    UI.el('clear-search').hidden = !on;
    UI.el('page-title').textContent = on ? 'Search Past IDP' : 'Past IDPs (portfolio)';
    UI.el('crumb-search').textContent = on ? ' / Search' : '';
  }

  renderRows(items, term, emptyMessage) {
    const newId = UI.param('new');
    const back = term ? `&q=${encodeURIComponent(term)}` : '';
    UI.el('idp-body').innerHTML = items.length
      ? items.map(p => `
        <tr${p.getId() === newId ? ' class="selected"' : ''}>
          <td><strong>${UI.highlight(p.getProjectName(), term)}</strong></td>
          <td style="white-space:nowrap">${UI.escape(UI.formatDate(p.getCompletionDate())) || '—'}</td>
          <td class="truncate" title="${UI.escape(p.getDescription())}">${UI.highlight(p.getDescription(), term)}</td>
          <td><a href="past-idp.html?id=${encodeURIComponent(p.getId())}${back}">View IDP</a></td>
        </tr>`).join('')
      : `<tr><td colspan="4" class="empty">${UI.escape(emptyMessage)}</td></tr>`;
  }

  clear() {
    this.form.reset();
    UI.clearFieldErrors(this.form);
    history.replaceState(null, '', location.pathname);
    this.displayAll();
    UI.el('query').focus();
  }
}

Layout.start(session => new SearchPastIDPPage(session).displayPage());
