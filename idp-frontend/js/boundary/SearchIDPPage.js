/*
 * Boundary: SearchIDPPage — also the Customer Dashboard (Customer Login lands here).
 * Normal flow: enter a term → Search → matching IDPs shown as cards
 * Alternate:   "Please enter a search term."; "No IDP found."
 * ?q=<term> re-runs a search, so "Back to results" on the project page returns here.
 */
class SearchIDPPage {
  constructor() {
    this.controller = new SearchIDPController();
    this.form = UI.el('search-form');
  }

  displayPage() {
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('clear-search').addEventListener('click', () => this.clear());

    const q = UI.param('q');
    if (q) {
      UI.el('term').value = q;
      this.search();
    } else {
      this.displayFeatured();
    }
  }

  displayFeatured() {
    const result = this.controller.getFeaturedProjects();
    UI.el('results-title').textContent = 'Featured projects';
    UI.el('clear-search').hidden = true;
    this.renderCards(result.items, '', 'No projects to show yet.');
  }

  onSubmit(e) {
    e.preventDefault();
    this.search();
  }

  search() {
    UI.clearFieldErrors(this.form);
    const result = this.controller.searchIDP(UI.el('term').value);

    if (result.fields.term) {
      UI.showFieldErrors(this.form, result.fields);
      return;
    }

    history.replaceState(null, '', `?q=${encodeURIComponent(result.term)}`);
    const n = result.items.length;
    UI.el('results-title').textContent = `${n} project${n === 1 ? '' : 's'} match “${result.term}”`;
    UI.el('clear-search').hidden = false;
    this.renderCards(result.items, result.term, result.message);   // "No IDP found." when empty
  }

  renderCards(items, term, emptyMessage) {
    const back = term ? `&from=search&q=${encodeURIComponent(term)}` : '&from=browse';
    UI.el('results-grid').innerHTML = items.map(item =>
      UI.projectCard(item, { href: `project.html?id=${encodeURIComponent(item.projectId)}${back}`, term })
    ).join('');

    const empty = UI.el('results-empty');
    empty.textContent = emptyMessage || '';
    empty.hidden = items.length > 0;
  }

  clear() {
    this.form.reset();
    UI.clearFieldErrors(this.form);
    history.replaceState(null, '', location.pathname);
    this.displayFeatured();
    UI.el('term').focus();
  }
}

Layout.start(() => new SearchIDPPage().displayPage());
