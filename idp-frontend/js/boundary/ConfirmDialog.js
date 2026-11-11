/*
 * ConfirmDialog — the "Are you sure?" modal used by the delete boundaries.
 * The markup lives in the page: a .modal-backdrop with a Cancel and a confirm button.
 * Cancel, Escape and clicking the backdrop all close it without doing anything.
 */
class ConfirmDialog {
  constructor(modalId, cancelId, confirmId, onConfirm) {
    this.modal = UI.el(modalId);
    this.cancelBtn = UI.el(cancelId);
    this.onConfirm = onConfirm;
    this.lastFocus = null;

    this.cancelBtn.addEventListener('click', () => this.close());
    UI.el(confirmId).addEventListener('click', () => { this.close(); this.onConfirm(); });
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !this.modal.hidden) this.close(); });
  }

  open() {
    this.lastFocus = document.activeElement;
    this.modal.hidden = false;
    this.cancelBtn.focus();
  }

  close() {
    this.modal.hidden = true;
    if (this.lastFocus && document.contains(this.lastFocus)) this.lastFocus.focus();
  }
}
