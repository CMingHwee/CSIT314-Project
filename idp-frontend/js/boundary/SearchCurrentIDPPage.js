/*
 * Boundary: SearchCurrentIDPPage — also the Current IDPs list (My Projects).
 * Normal flow: query → Search → matching current IDPs ("2 of 4 current IDPs match …")
 * Alternate:   "Please enter a search query."; "No matching IDP found."
 * ?new=<id> highlights a project just created; ?q=<query> re-runs a search.
 */
class SearchCurrentIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new SearchCurrentIDPController();
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
    const result = this.controller.getCurrentIDPs(this.session.accountId);

    // Delete Company Info postcondition: without company info, the designer's projects are hidden from customers.
    UI.el('visibility-note').innerHTML = result.hasCompany ? '' : `
      <div class="banner banner-info">
        Your projects are hidden from customers until you add company information.
        <a href="create-company.html">Create Company Info</a>
      </div>`;

    this.setSearchMode(false);
    const n = result.items.length;
    UI.el('list-title').textContent = `Current IDPs · ${n}`;
    this.renderRows(result.items, '', result.message);
  }

  search() {
    UI.clearFieldErrors(this.form);
    const result = this.controller.searchCurrentIDP(this.session.accountId, UI.el('query').value);
    if (result.fields.query) {
      UI.showFieldErrors(this.form, result.fields);
      return;
    }
    history.replaceState(null, '', `?q=${encodeURIComponent(result.query)}`);
    this.setSearchMode(true);
    const n = result.items.length;
    UI.el('list-title').textContent =
      `${n} of ${result.total} current IDP${result.total === 1 ? '' : 's'} match${n === 1 ? 'es' : ''} “${result.query}”`;
    this.renderRows(result.items, result.query, result.message);   // "No matching IDP found." when empty
  }

  setSearchMode(on) {
    UI.el('clear-search').hidden = !on;
    UI.el('page-title').textContent = on ? 'Search Current IDP' : 'Current IDPs';
    UI.el('crumb-search').textContent = on ? ' / Search' : '';
  }

  renderRows(items, term, emptyMessage) {
    const newId = UI.param('new');
    const back = term ? `&q=${encodeURIComponent(term)}` : '';
    UI.el('idp-body').innerHTML = items.length
      ? items.map(p => `
        <tr${p.getId() === newId ? ' class="selected"' : ''}>
          <td>${UI.highlight(p.getProjectName(), term)}</td>
          <td>${UI.highlight(p.getCustomerName(), term)}</td>
          <td style="white-space:nowrap">${UI.escape(UI.formatDate(p.getStartDate()))}</td>
          <td>${UI.progressBar(p.getProgress(), p.getProgressNote())}</td>
          <td><a href="current-idp.html?id=${encodeURIComponent(p.getId())}${back}">View IDP</a></td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="empty">${UI.escape(emptyMessage)}</td></tr>`;
  }

  clear() {
    this.form.reset();
    UI.clearFieldErrors(this.form);
    history.replaceState(null, '', location.pathname);
    this.displayAll();
    UI.el('query').focus();
  }
}

Layout.start(session => new SearchCurrentIDPPage(session).displayPage());
