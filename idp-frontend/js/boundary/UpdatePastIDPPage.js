/*
 * Boundary: UpdatePastIDPPage. Opened as update-past-idp.html?id=<project id>.
 * Normal flow: edit Name, Completion Date, Description → Save → "IDP Updated Successfully"
 * Alternate:   "Please fill in all required fields." (under the field, as in the wireframe);
 *              Cancel; "Validation failed." with the reason underneath
 */
class UpdatePastIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new UpdatePastIDPController();
    this.form = UI.el('idp-form');
    this.id = UI.param('id');
  }

  displayPage() {
    const result = this.controller.getPastIDP(this.session.accountId, this.id);
    if (!result.success) {
      UI.el('crumb-name').textContent = 'Not found';
      UI.showBanner('error', `${UI.escape(result.message)} <a href="past-idps.html">Back to Past IDPs</a>`);
      return;
    }
    const p = result.project;
    const viewUrl = `past-idp.html?id=${encodeURIComponent(p.getId())}`;
    UI.el('crumb-name').textContent = p.getProjectName();
    UI.el('crumb-name').href = viewUrl;
    UI.el('cancel-link').href = viewUrl;
    UI.el('name').value = p.getProjectName();
    UI.el('completionDate').value = p.getCompletionDate();
    UI.el('completionDate').max = DateUtil.todayKey();
    UI.el('date-hint').textContent = p.getCompletionDate() ? `Currently saved as ${UI.formatDate(p.getCompletionDate())}.` : '';
    UI.el('description').value = p.getDescription();

    UI.el('editing-pill').hidden = false;
    this.form.hidden = false;
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('name').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.updatePastIDP(this.session.accountId, this.id, v.name, v.description, v.completionDate);
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
    const note = result.dateCorrectedFrom ? ` Completion date corrected from ${UI.formatDate(result.dateCorrectedFrom)}.` : '';
    UI.setFlash('success', `${result.message}.${note}`);
    location.href = `past-idp.html?id=${encodeURIComponent(result.project.getId())}`;
  }
}

Layout.start(session => new UpdatePastIDPPage(session).displayPage());
