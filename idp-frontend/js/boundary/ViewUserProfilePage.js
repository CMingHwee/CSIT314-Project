/*
 * Boundary: ViewUserProfilePage
 * Normal flow: All Profiles → "View Profile" → personal and professional details,
 *              with links to Edit and Suspend
 * Alternate:   "Profile not found for this user." (e.g. opened for an account without a profile)
 * Opened as user-profiles.html, ?id=<profile id>, or ?account=<account id> from User Accounts.
 */
class ViewUserProfilePage {
  constructor() {
    this.controller = new ViewUserProfileController();
    this.body = UI.el('profiles-body');
  }

  displayPage() {
    const result = this.controller.getUserProfiles();
    if (!result.success) {
      this.body.innerHTML = `<tr><td colspan="7" class="empty">${UI.escape(result.message)}
        <br><a href="create-profile.html">Create Profile</a></td></tr>`;
    } else {
      this.renderRows(result.rows);
    }

    this.body.addEventListener('click', e => {
      const btn = e.target.closest('[data-view]');
      if (btn) this.showProfile(this.controller.getUserProfile(btn.dataset.view), true);
    });

    const id = UI.param('id');
    const accountId = UI.param('account');
    if (id) this.showProfile(this.controller.getUserProfile(id));
    else if (accountId) this.showProfile(this.controller.getProfileForAccount(accountId));
  }

  renderRows(rows) {
    this.body.innerHTML = rows.map(({ profile: p, account: a }) => `
      <tr data-id="${UI.escape(p.getId())}">
        <td>${UI.escape(a ? a.getUsername() : '—')}</td>
        <td>${UI.escape(p.getFullName())}</td>
        <td>${UI.escape(a ? a.getRole() : '—')}</td>
        <td>${UI.escape(p.getCompanyName()) || '—'}</td>
        <td>${UI.escape(p.getLocation()) || '—'}</td>
        <td>${UI.statusPill(p.getStatus())}</td>
        <td><button type="button" class="link" data-view="${UI.escape(p.getId())}">View Profile</button></td>
      </tr>`).join('');
  }

  // userClicked: clear any earlier message; on page load keep it (e.g. "Profile Updated Successfully").
  showProfile(result, userClicked = false) {
    if (!result.success) {
      this.displayError(result);
      return;
    }
    if (userClicked) UI.clearBanner();
    const { profile: p, account: a } = result;
    const username = a ? a.getUsername() : p.getFullName();
    history.replaceState(null, '', `?id=${encodeURIComponent(p.getId())}`);
    this.body.querySelectorAll('tr').forEach(tr => tr.classList.toggle('selected', tr.dataset.id === p.getId()));

    UI.el('crumb-user').textContent = ` / ${username}`;
    UI.el('profile-title').innerHTML = `Profile · ${UI.escape(username)}${a ? ` (${UI.escape(a.getRole())})` : ''} &nbsp;${UI.statusPill(p.getStatus())}`;
    UI.el('p-photo').innerHTML = UI.photo(p.getPhoto(), p.getFullName());
    UI.el('p-first').textContent = p.getFirstName();
    UI.el('p-last').textContent = p.getLastName();
    UI.el('p-address').textContent = p.getAddress();
    UI.el('p-company').textContent = p.getCompanyName() || '—';
    UI.el('p-regno').textContent = p.getCompanyRegNo() || '—';
    UI.el('edit-link').href = `edit-profile.html?id=${encodeURIComponent(p.getId())}`;
    UI.el('suspend-link').href = `suspend-profile.html?id=${encodeURIComponent(p.getId())}`;

    const card = UI.el('profile-card');
    card.hidden = false;
    card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  displayError(result) {
    UI.el('profile-card').hidden = true;
    const create = result.account
      ? ` <a href="create-profile.html?account=${encodeURIComponent(result.account.getId())}">Create a profile for ${UI.escape(result.account.getUsername())}</a>`
      : '';
    UI.showBanner('error', UI.escape(result.message) + create);
  }
}

Layout.start(() => new ViewUserProfilePage().displayPage());
