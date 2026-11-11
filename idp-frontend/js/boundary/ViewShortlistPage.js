/*
 * Boundary: ViewShortlistPage
 * Normal flow: My Profile → My Shortlist → project cards (image, name, designer); click → View IDP
 * Alternate:   "Your shortlist is empty. Browse projects to add some!"
 * ?added=<project id> marks the card just saved.
 * SearchShortlistPage reuses renderCards() to show filtered results.
 */
class ViewShortlistPage {
  constructor(session) {
    this.session = session;
    this.controller = new ViewShortlistController();
    this.addedId = UI.param('added');
  }

  // Returns true if the shortlist has projects.
  displayPage() {
    const result = this.controller.getShortlist(this.session.accountId);
    if (!result.success) {
      this.displayError(result);
      return false;
    }
    this.total = result.items.length;
    UI.el('search-form').hidden = false;
    this.displayAll(result.items);
    return true;
  }

  displayAll(items) {
    UI.el('shortlist-title').textContent = `Saved projects · ${items.length}`;
    UI.el('clear-search').hidden = true;
    this.renderCards(items);
  }

  renderCards(items, term = '') {
    UI.el('shortlist-grid').innerHTML = items.map(item =>
      UI.projectCard(item, {
        href: `project.html?id=${encodeURIComponent(item.projectId)}&from=shortlist`,
        term,
        tag: !term && item.projectId === this.addedId ? 'Just added' : ''
      })
    ).join('');
    UI.el('shortlist-empty').hidden = true;
  }

  displayError(result) {
    UI.el('shortlist-title').textContent = 'Saved projects · 0';
    UI.el('shortlist-empty-text').textContent = result.message;
    UI.el('shortlist-empty').hidden = false;
  }
}
