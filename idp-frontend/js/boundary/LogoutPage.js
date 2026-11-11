/*
 * Boundary: LogoutPage — the "Log out?" confirmation dialog.
 * Layout attaches it to the sidebar's Log out link on every designer page.
 * Normal flow: Log out → "Are you sure you want to log out?" → confirm → Login Page
 * Alternate:   Cancel → stays logged in
 */
class LogoutPage {
  constructor() {
    this.controller = new LogoutController();
    this.lastFocus = null;
  }

  displayPage() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-backdrop" id="logout-modal" hidden>
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <h2 id="logout-title">Log out?</h2>
          <p>Are you sure you want to log out?</p>
          <div class="actions">
            <button class="btn btn-secondary" type="button" id="logout-cancel">Cancel</button>
            <button class="btn btn-primary" type="button" id="logout-confirm">Log out</button>
          </div>
        </div>
      </div>`);

    this.modal = UI.el('logout-modal');
    UI.el('logout-link').addEventListener('click', e => { e.preventDefault(); this.open(); });
    UI.el('logout-cancel').addEventListener('click', () => this.close());
    UI.el('logout-confirm').addEventListener('click', () => this.onConfirm());
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !this.modal.hidden) this.close(); });
  }

  open() {
    this.lastFocus = document.activeElement;
    this.modal.hidden = false;
    UI.el('logout-cancel').focus();
  }

  close() {
    this.modal.hidden = true;
    if (this.lastFocus) this.lastFocus.focus();
  }

  onConfirm() {
    const result = this.controller.logout();
    UI.setFlash('success', result.message);
    location.replace(result.redirect);
  }
}
