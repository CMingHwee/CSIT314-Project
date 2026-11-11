/*
 * Boundary: CreateCompanyInfoPage
 * Normal flow: fill in the 5 fields → Save → "Company Information Created Successfully" → Company Profile
 * Alternate:   required fields; "Company with this registration number already exists."; Cancel
 */
class CreateCompanyInfoPage {
  constructor(session) {
    this.session = session;
    this.controller = new CreateCompanyInfoController();
    this.form = UI.el('company-form');
  }

  displayPage() {
    // One company per designer: send them to the existing record instead.
    if (this.controller.hasCompanyInfo(this.session.accountId)) {
      UI.setFlash('info', 'You already have company information. Use Edit to change it.');
      location.replace('company-profile.html');
      return;
    }
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('companyName').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.createCompanyInfo(
      this.session.accountId, v.companyName, v.registrationNumber, v.address, v.contactEmail, v.description);

    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (!Object.keys(result.fields).length || result.message === 'Please fill in all required fields.') {
      UI.showBanner('error', UI.escape(result.message));
    }
    UI.showFieldErrors(this.form, result.fields);
  }

  displaySuccess(result) {
    UI.setFlash('success', result.message);
    location.href = 'company-profile.html';
  }
}

Layout.start(session => new CreateCompanyInfoPage(session).displayPage());
