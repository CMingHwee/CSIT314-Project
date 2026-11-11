/*
 * Boundary: UpdateCurrentIDPPage. Opened as update-current-idp.html?id=<project id>.
 * Normal flow: edit Name, Description, Specifications → Save → "IDP Updated Successfully"
 * Alternate:   "Please fill in all required fields." (under the field, as in the wireframe);
 *              Cancel; "Validation failed." with the reason underneath
 */
class UpdateCurrentIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new UpdateCurrentIDPController();
    this.form = UI.el('idp-form');
    this.id = UI.param('id');
  }

  displayPage() {
    const result = this.controller.getCurrentIDP(this.session.accountId, this.id);
    if (!result.success) {
      UI.el('crumb-name').textContent = 'Not found';
      UI.showBanner('error', `${UI.escape(result.message)} <a href="my-projects.html">Back to Current IDPs</a>`);
      return;
    }
    const p = result.project;
    const viewUrl = `current-idp.html?id=${encodeURIComponent(p.getId())}`;
    UI.el('crumb-name').textContent = p.getProjectName();
    UI.el('crumb-name').href = viewUrl;
    UI.el('cancel-link').href = viewUrl;
    UI.el('name').value = p.getProjectName();
    UI.el('customer').value = p.getCustomerName();
    UI.el('startDate').value = UI.formatDate(p.getStartDate());
    UI.el('description').value = p.getDescription();
    UI.el('specifications').value = p.getSpecifications();

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
    const result = this.controller.updateCurrentIDP(this.session.accountId, this.id, v.name, v.description, v.specifications);
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
    location.href = `current-idp.html?id=${encodeURIComponent(result.project.getId())}`;
  }
}

Layout.start(session => new UpdateCurrentIDPPage(session).displayPage());
