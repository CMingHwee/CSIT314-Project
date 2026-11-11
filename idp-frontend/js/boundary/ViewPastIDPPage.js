/*
 * Boundary: ViewPastIDPPage. Opened as past-idp.html?id=<project id>[&q=<search>].
 * Normal flow: completion date, status and description
 * Alternate:   "IDP not found."
 */
class ViewPastIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new ViewPastIDPController();
    this.id = UI.param('id');
  }

  // Returns true when the IDP is shown.
  displayPage() {
    const q = UI.param('q');
    if (q) UI.el('crumb-list').href = `past-idps.html?q=${encodeURIComponent(q)}`;

    const result = this.controller.viewPastIDP(this.session.accountId, this.id);
    if (!result.success) {
      this.displayError(result);
      return false;
    }
    const p = result.project;
    document.title = `${p.getProjectName()} · IDP Platform`;
    UI.el('crumb-name').textContent = p.getProjectName();
    UI.el('idp-title').textContent = p.getProjectName();
    UI.el('d-completed').textContent = UI.formatDate(p.getCompletionDate()) || '—';
    UI.el('d-status').innerHTML = `<span class="pill inactive">${UI.escape(p.getStatus())}</span>`;
    if (p.getCategoryName()) {
      UI.el('d-category').textContent = p.getCategoryName();
      UI.el('d-category-wrap').hidden = false;
    }
    UI.el('d-description').textContent = p.getDescription();
    const imgs = p.getImages();
    if (imgs.length) {
      UI.el('d-gallery').innerHTML = imgs.slice(0, 4).map((src, i) => UI.imageBox(src, `${p.getProjectName()} — picture ${i + 1}`)).join('');
      UI.el('d-gallery').hidden = false;
    }
    UI.el('update-link').href = `update-past-idp.html?id=${encodeURIComponent(p.getId())}`;
    UI.el('header-actions').hidden = false;
    UI.el('idp-card').hidden = false;
    return true;
  }

  displayError(result) {
    UI.el('crumb-name').textContent = 'Not found';
    UI.showBanner('error', `${UI.escape(result.message)} <a href="past-idps.html">Back to Past IDPs</a>`);
  }
}
