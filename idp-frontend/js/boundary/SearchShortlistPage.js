/*
 * Boundary: SearchShortlistPage — search bar on My Shortlist.
 * Normal flow: enter a term → Search → only matching saved projects are shown
 * Alternate:   "Please enter a search term."; "No matching saved projects found."
 */
class SearchShortlistPage {
  constructor(session, viewPage) {
    this.session = session;
    this.view = viewPage;
    this.controller = new SearchShortlistController();
    this.form = UI.el('search-form');
  }

  displayPage() {
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('clear-search').addEventListener('click', () => this.clear());
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearFieldErrors(this.form);

    const result = this.controller.searchShortlist(this.session.accountId, UI.el('term').value);
    if (result.success) this.displayResults(result);
    else this.displayError(result);
  }

  displayResults(result) {
    UI.el('shortlist-title').textContent =
      `${result.items.length} of ${result.total} saved projects match “${result.term}”`;
    UI.el('clear-search').hidden = false;
    this.view.renderCards(result.items, result.term);
  }

  displayError(result) {
    if (result.fields.term) {
      UI.showFieldErrors(this.form, result.fields);
      return;
    }
    // "No matching saved projects found."
    UI.el('shortlist-title').textContent = `0 of ${result.total} saved projects match “${result.term}”`;
    UI.el('clear-search').hidden = false;
    UI.el('shortlist-grid').innerHTML = '';
    UI.el('shortlist-empty-text').textContent = result.message;
    UI.el('browse-link').hidden = true;
    UI.el('shortlist-empty').hidden = false;
  }

  clear() {
    this.form.reset();
    UI.clearFieldErrors(this.form);
    UI.el('browse-link').hidden = false;
    this.view.displayPage();
    UI.el('term').focus();
  }
}
