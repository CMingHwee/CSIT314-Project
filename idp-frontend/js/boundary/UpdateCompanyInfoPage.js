/*
 * Boundary: UpdateCompanyInfoPage
 * Normal flow: Edit → fields enabled → modify → Save → "Company Information Updated Successfully"
 * Alternate:   required fields; duplicate registration number; Cancel
 */
class UpdateCompanyInfoPage {
  constructor(session) {
    this.session = session;
    this.controller = new UpdateCompanyInfoController();
    this.form = UI.el('company-form');
  }

  displayPage() {
    const result = this.controller.getCompanyInfo(this.session.accountId);
    if (!result.success) {
      UI.el('no-company-text').textContent = result.message;
      UI.el('no-company').hidden = false;
      return;
    }

    const c = result.company;
    for (const f of CompanyInfo.FIELDS) UI.el(f.key).value = c.get(f.key);

    this.form.hidden = false;
    UI.el('editing-pill').hidden = false;
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('companyName').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.updateCompanyInfo(
      this.session.accountId, v.companyName, v.registrationNumber, v.address, v.contactEmail, v.description);

    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (!Object.keys(result.fields).length) {
      UI.showBanner('error', UI.escape(result.message));
    }
    // The wireframe shows "Please fill in all required fields." under the empty field itself.
    const fields = { ...result.fields };
    if (result.message === 'Please fill in all required fields.') {
      for (const k of Object.keys(fields)) fields[k] = result.message;
    }
    UI.showFieldErrors(this.form, fields);
  }

  displaySuccess(result) {
    UI.setFlash('success', result.message);
    location.href = 'company-profile.html';
  }
}

Layout.start(session => new UpdateCompanyInfoPage(session).displayPage());
