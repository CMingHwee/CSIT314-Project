/*
 * Boundary: SearchUserProfilePage
 * Normal flow: choose Company Name or Location → enter a term → Search → matching profiles
 * Alternate:   "Please enter a company name or location."; "No matching profiles found."
 */
class SearchUserProfilePage {
  constructor() {
    this.controller = new SearchUserProfileController();
    this.form = UI.el('search-form');
  }

  displayPage() {
    this.form.addEventListener('submit', e => { e.preventDefault(); this.search(); });
    UI.el('clear-btn').addEventListener('click', () => this.clear());

    // search-profiles.html?by=location&q=Tampines re-runs a search
    const q = UI.param('q');
    if (q) {
      const by = UI.param('by') === 'location' ? 'location' : 'company';
      this.form.querySelector(`input[name="by"][value="${by}"]`).checked = true;
      UI.el('term').value = q;
      this.search();
    } else {
      UI.el('term').focus();
    }
  }

  search() {
    UI.clearFieldErrors(this.form);
    const { by, term } = UI.formValues(this.form);
    const result = this.controller.searchUserProfiles(by, term);

    if (result.fields.term) {
      UI.el('results-card').hidden = true;
      UI.showFieldErrors(this.form, result.fields);
      return;
    }
    history.replaceState(null, '', `?by=${encodeURIComponent(result.by)}&q=${encodeURIComponent(result.term)}`);
    this.displayResults(result);
  }

  displayResults(result) {
    const n = result.rows.length;
    const where = result.by === 'location' ? 'in' : 'matching';
    UI.el('results-title').textContent = `${n} profile${n === 1 ? '' : 's'} ${where} “${result.term}”`;

    const hlCompany = result.by === 'company' ? result.term : '';
    const hlLocation = result.by === 'location' ? result.term : '';
    UI.el('results-body').innerHTML = n
      ? result.rows.map(({ profile: p, account: a }) => `
        <tr>
          <td class="user-cell"><strong>${UI.escape(a ? a.getUsername() : '—')}</strong><span>${UI.escape(p.getFullName())}</span></td>
          <td>${UI.escape(a ? a.getRole() : '—')}</td>
          <td>${p.getCompanyName() ? UI.highlight(p.getCompanyName(), hlCompany) : '—'}</td>
          <td>${p.getLocation() ? UI.highlight(p.getLocation(), hlLocation) : UI.highlight(p.getAddress(), hlLocation)}</td>
          <td>${UI.statusPill(p.getStatus())}</td>
          <td><a href="user-profiles.html?id=${encodeURIComponent(p.getId())}">View</a></td>
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

Layout.start(() => new SearchUserProfilePage().displayPage());
