/*
 * Boundary: EditUserProfilePage. Opened as edit-profile.html?id=<profile id>.
 * Normal flow: edit details → Save → "Profile Updated Successfully" → back to the profile
 * Alternate:   "Please fill in all required fields." (under the empty field, as in the wireframe);
 *              Cancel; "Validation failed." with the reason underneath
 */
class EditUserProfilePage {
  constructor() {
    this.controller = new UpdateUserProfileController();
    this.form = UI.el('profile-form');
    this.id = UI.param('id');
  }

  displayPage() {
    const result = this.controller.getUserProfile(this.id);
    if (!result.success) {
      UI.el('crumb-user').textContent = 'Not found';
      UI.showBanner('error', `${UI.escape(result.message)} <a href="user-profiles.html">Go to User Profiles</a>`);
      return;
    }
    const { profile: p, account: a } = result;
    const username = a ? a.getUsername() : p.getFullName();
    UI.el('crumb-user').textContent = username;
    UI.el('personal-title').textContent = `Personal details · ${username}${a ? ` (${a.getRole()})` : ''}`;
    UI.el('firstName').value = p.getFirstName();
    UI.el('lastName').value = p.getLastName();
    UI.el('address').value = p.getAddress();
    UI.el('companyName').value = p.getCompanyName();
    UI.el('companyRegNo').value = p.getCompanyRegNo();
    UI.el('cancel-link').href = `user-profiles.html?id=${encodeURIComponent(p.getId())}`;

    const pill = UI.el('status-pill');
    pill.textContent = `Profile status: ${p.getStatus()}`;
    pill.classList.toggle('inactive', p.isSuspended());
    pill.hidden = false;

    this.form.hidden = false;
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('firstName').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.updateUserProfile(this.id, v.firstName, v.lastName, v.address, v.companyName, v.companyRegNo);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (!Object.keys(result.fields).length) {
      UI.showBanner('error', UI.escape(result.message));
      return;
    }
    const fields = { ...result.fields };
    if (result.message === 'Please fill in all required fields.') {
      for (const k of Object.keys(fields)) fields[k] = result.message;
    }
    UI.showFieldErrors(this.form, fields, result.reasons);
  }

  displaySuccess(result) {
    UI.setFlash('success', result.message);
    location.href = `user-profiles.html?id=${encodeURIComponent(result.profile.getId())}`;
  }
}

Layout.start(() => new EditUserProfilePage().displayPage());
