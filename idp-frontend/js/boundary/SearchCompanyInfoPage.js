/*
 * Boundary: SearchCompanyInfoPage
 * Search bar on the Company Profile page; highlights the matching details.
 * Alternate: "Please enter a search term."; "No matching details found in your profile."
 */
class SearchCompanyInfoPage {
  constructor(session, viewPage) {
    this.session = session;
    this.view = viewPage;
    this.controller = new SearchCompanyInfoController();
    this.form = UI.el('search-form');
  }

  displayPage() {
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('clear-search').addEventListener('click', () => this.clear());
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const result = this.controller.searchCompanyInfo(this.session.accountId, UI.el('term').value);
    if (result.success) this.displayResults(result);
    else this.displayError(result);
  }

  displayResults(result) {
    const labels = result.matches.map(k => CompanyInfo.FIELDS.find(f => f.key === k).label);
    const n = result.matches.length;
    UI.el('details-title').textContent = `${n} match${n === 1 ? '' : 'es'} · in ${labels.join(', ')}`;
    UI.el('clear-search').hidden = false;
    this.view.displayDetails(result.term, result.matches);
  }

  displayError(result) {
    if (result.fields.term) {
      UI.showFieldErrors(this.form, result.fields);
      return;
    }
    // "No matching details found in your profile."
    UI.el('details-title').textContent = result.message;
    UI.el('clear-search').hidden = false;
    this.view.displayDetails();
  }

  clear() {
    this.form.reset();
    UI.clearFieldErrors(this.form);
    UI.el('details-title').textContent = 'Read-only · as customers will see it';
    UI.el('clear-search').hidden = true;
    this.view.displayDetails();
    UI.el('term').focus();
  }
}
