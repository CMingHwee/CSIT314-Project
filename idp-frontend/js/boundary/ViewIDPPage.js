/*
 * Boundary: ViewIDPPage
 * Opened as project.html?id=<project id>&from=search|shortlist|browse[&q=<term>]
 * Normal flow: read-only details, images and progress status
 * Alternate:   "Project not found or has been removed."; Back → search results / shortlist
 */
class ViewIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new ViewIDPController();
    this.projectId = UI.param('id');
  }

  // Returns the result (with .project and .inShortlist) when shown, otherwise null.
  displayPage() {
    this.setBackLink();

    const result = this.controller.viewIDP(this.session.accountId, this.projectId);
    if (!result.success) {
      this.displayError(result);
      return null;
    }

    const p = result.project;
    document.title = `${p.getProjectName()} · IDP Platform`;
    UI.el('project-name').textContent = p.getProjectName();
    UI.el('p-designer').textContent = result.designer;
    UI.el('p-designer-photo').innerHTML = p.getDesignerPhoto() ? UI.photo(p.getDesignerPhoto(), result.designer, 'photo photo-sm') : '';

    // Gallery: first picture large, the next three small; missing ones show the placeholder.
    const imgs = p.getImages();
    UI.el('gallery-hero').innerHTML = UI.imageBox(imgs[0], `${p.getProjectName()} — main picture`, 'hero');
    UI.el('gallery-thumbs').innerHTML = [1, 2, 3]
      .map(i => UI.imageBox(imgs[i], `${p.getProjectName()} — picture ${i + 1}`)).join('');
    UI.el('p-status').innerHTML =
      `<span class="pill${p.getStatus() === Project.CURRENT ? '' : ' inactive'}">${UI.escape(p.getStatus())}</span>`;
    // Past IDPs added to a portfolio have a completion date instead of a start date.
    if (!p.getStartDate() && p.getCompletionDate()) {
      UI.el('p-start-label').textContent = 'Completed';
      UI.el('p-start').textContent = UI.formatDate(p.getCompletionDate());
    } else {
      UI.el('p-start').textContent = UI.formatDate(p.getStartDate());
    }
    const specs = p.getSpecificationList();
    if (specs.length) {
      UI.el('p-specs').innerHTML = specs.map(s => `<li>${UI.escape(s)}</li>`).join('');
      UI.el('p-specs-wrap').hidden = false;
    }
    UI.el('p-description').textContent = p.getDescription();
    if (p.getCategoryName()) {
      UI.el('p-category').textContent = p.getCategoryName();
      UI.el('p-category-wrap').hidden = false;
    }

    const pct = p.getProgress();
    UI.el('p-progress-text').textContent = `${pct}% complete`;
    UI.el('p-progress').setAttribute('aria-valuenow', String(pct));
    UI.el('p-progress').querySelector('span').style.width = `${pct}%`;

    UI.el('project-header').hidden = false;
    UI.el('project-card').hidden = false;
    return result;
  }

  // "Back" returns to wherever the customer came from.
  setBackLink() {
    const from = UI.param('from');
    const q = UI.param('q');
    const link = UI.el('back-link');
    if (from === 'shortlist') {
      link.href = 'my-profile.html';
      link.textContent = '← Back to My Shortlist';
    } else if (from === 'search' && q) {
      link.href = `browse-projects.html?q=${encodeURIComponent(q)}`;
      link.textContent = '← Back to results';
    } else {
      link.href = 'browse-projects.html';
      link.textContent = '← Back to projects';
    }
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }
}
