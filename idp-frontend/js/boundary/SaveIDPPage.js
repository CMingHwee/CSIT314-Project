/*
 * Boundary: SaveIDPPage — the "Save to Shortlist" button on the project page.
 * Normal flow: Save to Shortlist → "Added to Shortlist" → My Shortlist, with the new card marked
 * Alternate:   "Project is already in your shortlist."
 */
class SaveIDPPage {
  constructor(session, viewResult) {
    this.session = session;
    this.controller = new SaveIDPController();
    this.projectId = viewResult.project.getId();
    this.inShortlist = viewResult.inShortlist;
  }

  displayPage() {
    const btn = UI.el('save-btn');
    if (this.inShortlist) {
      // Still clickable, so the alternate flow message can be shown.
      btn.textContent = '✓ In your shortlist';
      btn.classList.replace('btn-primary', 'btn-secondary');
    }
    btn.addEventListener('click', () => this.onSave());
  }

  onSave() {
    UI.clearBanner();
    const result = this.controller.saveIDP(this.session.accountId, this.projectId);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }

  displaySuccess(result) {
    UI.setFlash('success', `${result.message} — “${result.project.getProjectName()}”`);
    location.href = `my-profile.html?added=${encodeURIComponent(this.projectId)}`;
  }
}
