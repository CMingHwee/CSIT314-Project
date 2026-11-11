/*
 * Boundary: DeleteCategoryPage — Delete link in the categories table + confirmation dialog.
 * Normal flow: Delete → "Are you sure? This action cannot be undone." → "Category Deleted Successfully"
 * Alternate:   Cancel; "Cannot delete category. It is currently assigned to existing IDPs."
 */
class DeleteCategoryPage {
  constructor(onDeleted) {
    this.controller = new DeleteCategoryController();
    this.onDeleted = onDeleted;
    this.modal = UI.el('delete-modal');
    this.targetId = null;
    this.lastFocus = null;
  }

  displayPage() {
    UI.el('categories-body').addEventListener('click', e => {
      const btn = e.target.closest('[data-delete]');
      if (btn) this.onDeleteClicked(btn.dataset.delete, btn.dataset.name);
    });
    UI.el('delete-cancel').addEventListener('click', () => this.close());
    UI.el('delete-confirm').addEventListener('click', () => this.onConfirm());
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !this.modal.hidden) this.close(); });
  }

  onDeleteClicked(id, name) {
    UI.clearBanner();
    const check = this.controller.canDelete(id);
    if (!check.success) {
      this.displayError(check);
      return;
    }
    this.targetId = id;
    UI.el('delete-title').textContent = `Delete “${name}”?`;
    this.lastFocus = document.activeElement;
    this.modal.hidden = false;
    UI.el('delete-cancel').focus();
  }

  close() {
    this.modal.hidden = true;
    if (this.lastFocus && document.contains(this.lastFocus)) this.lastFocus.focus();
  }

  onConfirm() {
    this.close();
    const result = this.controller.deleteCategory(this.targetId);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    UI.showBanner('error', UI.escape(result.message));
  }

  displaySuccess(result) {
    UI.showBanner('success', `${UI.escape(result.message)} — “${UI.escape(result.category.getName())}”.`);
    this.onDeleted();
  }
}
