/*
 * Boundary: ViewCompanyInfoPage
 * Shows the designer's company details read-only, as customers see them.
 * Alternate: "No company information found. Please create a profile."
 * SearchCompanyInfoPage reuses displayDetails() to highlight matches.
 */
class ViewCompanyInfoPage {
  constructor(session) {
    this.session = session;
    this.controller = new ViewCompanyInfoController();
    this.company = null;
  }

  // Returns true if there is company information to show.
  displayPage() {
    const result = this.controller.getCompanyInfo(this.session.accountId);
    if (!result.success) {
      this.displayError(result);
      return false;
    }
    this.company = result.company;
    UI.el('header-actions').hidden = false;
    UI.el('company-card').hidden = false;
    this.displayDetails();
    return true;
  }

  // term + matches are optional; when given, matching fields are highlighted.
  displayDetails(term = '', matches = []) {
    const c = this.company;
    UI.el('company-details').innerHTML = CompanyInfo.FIELDS.map(f => {
      const isMatch = matches.includes(f.key);
      const full = f.key === 'description' || f.key === 'address' || f.key === 'contactEmail' ? ' full' : '';
      const label = isMatch ? `${f.label} · match` : f.label;
      const value = isMatch ? UI.highlight(c.get(f.key), term) : UI.escape(c.get(f.key));
      const dimmed = term && !isMatch ? ' style="color:var(--muted);font-weight:500"' : '';
      return `
        <div class="${(full + (isMatch ? ' match' : '')).trim()}">
          <dt>${label}</dt>
          <dd${f.key === 'description' ? ' class="long"' : ''}${dimmed}>${value}</dd>
        </div>`;
    }).join('');
  }

  displayError(result) {
    UI.el('no-company-text').textContent = result.message;
    UI.el('no-company').hidden = false;
  }
}
