/*
 * Boundary: ViewUserAccountPage
 * Lists every account; clicking "View" shows the selected account's details,
 * with links to Update and Suspend.
 */
class ViewUserAccountPage {
  constructor() {
    this.controller = new ViewUserAccountController();
    this.body = UI.el('accounts-body');
    this.selectedId = UI.param('id');
  }

  displayPage() {
    const result = this.controller.getUserAccounts();
    if (!result.success) {
      this.body.innerHTML = `<tr><td colspan="6" class="empty">${UI.escape(result.message)}</td></tr>`;
      return;
    }

    this.body.innerHTML = result.accounts.map(a => `
      <tr data-id="${UI.escape(a.getId())}">
        <td>${UI.escape(a.getUsername())}</td>
        <td>${UI.escape(a.getEmail())}</td>
        <td>${UI.escape(a.getPhone()) || '—'}</td>
        <td>${UI.escape(a.getRole())}</td>
        <td>${UI.statusPill(a.getStatus())}</td>
        <td><button type="button" class="link" data-view="${UI.escape(a.getId())}">View</button></td>
      </tr>`).join('');

    this.body.addEventListener('click', e => {
      const btn = e.target.closest('[data-view]');
      if (btn) this.selectAccount(btn.dataset.view);
    });

    if (this.selectedId) this.selectAccount(this.selectedId);
  }

  selectAccount(id) {
    const result = this.controller.getUserAccount(id);
    if (!result.success) {
      this.displayError(result.message);
      return;
    }
    UI.clearBanner();
    this.selectedId = id;
    history.replaceState(null, '', `?id=${encodeURIComponent(id)}`);

    this.body.querySelectorAll('tr').forEach(tr =>
      tr.classList.toggle('selected', tr.dataset.id === String(id)));

    const a = result.account;
    UI.el('d-username').textContent = a.getUsername();
    UI.el('d-email').textContent = a.getEmail();
    UI.el('d-phone').textContent = a.getPhone() || '—';
    UI.el('d-role').textContent = a.getRole();
    UI.el('d-status').innerHTML = UI.statusPill(a.getStatus());
    UI.el('update-link').href = `update-account.html?id=${encodeURIComponent(a.getId())}`;
    UI.el('suspend-link').href = `suspend-account.html?id=${encodeURIComponent(a.getId())}`;
    UI.el('profile-link').href = `user-profiles.html?account=${encodeURIComponent(a.getId())}`;
    const panel = UI.el('selected-account');
    panel.hidden = false;
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  displayError(message) {
    UI.showBanner('error', UI.escape(message));
    UI.el('selected-account').hidden = true;
  }
}

Layout.start(() => new ViewUserAccountPage().displayPage());
