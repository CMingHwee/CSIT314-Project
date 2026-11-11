/*
 * Boundary: ViewCurrentIDPPage. Opened as current-idp.html?id=<project id>[&q=<search>].
 * Normal flow: details, progress, description and specifications
 * Alternate:   "IDP not found."
 */
class ViewCurrentIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new ViewCurrentIDPController();
    this.id = UI.param('id');
  }

  // Returns true when the IDP is shown.
  displayPage() {
    const q = UI.param('q');
    if (q) UI.el('crumb-list').href = `my-projects.html?q=${encodeURIComponent(q)}`;   // back to the search

    const result = this.controller.viewCurrentIDP(this.session.accountId, this.id);
    if (!result.success) {
      this.displayError(result);
      return false;
    }

    const p = result.project;
    document.title = `${p.getProjectName()} · IDP Platform`;
    UI.el('crumb-name').textContent = p.getProjectName();
    UI.el('idp-title').textContent = p.getProjectName();
    UI.el('d-customer').textContent = p.getCustomerName() || '—';
    UI.el('d-start').textContent = UI.formatDate(p.getStartDate()) || '—';
    UI.el('d-status').innerHTML = `<span class="pill">${UI.escape(p.getStatus())}</span>`;
    if (p.getCategoryName()) {
      UI.el('d-category').textContent = p.getCategoryName();
      UI.el('d-category-wrap').hidden = false;
    }

    const pct = p.getProgress();
    UI.el('d-progress-text').innerHTML = `<b>${pct}%</b>${p.getProgressNote() ? ' · ' + UI.escape(p.getProgressNote()) : ''}`;
    UI.el('d-progress').setAttribute('aria-valuenow', String(pct));
    UI.el('d-progress').querySelector('span').style.width = `${pct}%`;

    UI.el('d-description').textContent = p.getDescription();
    const imgs = p.getImages();
    if (imgs.length) {
      UI.el('d-gallery').innerHTML = imgs.slice(0, 4).map((src, i) => UI.imageBox(src, `${p.getProjectName()} — picture ${i + 1}`)).join('');
      UI.el('d-gallery').hidden = false;
    }
    const specs = p.getSpecificationList();
    UI.el('d-specs').innerHTML = specs.length
      ? `<ul class="spec-list">${specs.map(s => `<li>${UI.escape(s)}</li>`).join('')}</ul>`
      : `<span class="muted-cell">None yet — add them with Update IDP.</span>`;

    UI.el('update-link').href = `update-current-idp.html?id=${encodeURIComponent(p.getId())}`;
    UI.el('header-actions').hidden = false;
    UI.el('idp-card').hidden = false;
    return true;
  }

  displayError(result) {
    UI.el('crumb-name').textContent = 'Not found';
    UI.showBanner('error', `${UI.escape(result.message)} <a href="my-projects.html">Back to Current IDPs</a>`);
  }
}
