/*
 * Boundary: CreatePastIDPPage
 * Normal flow: Name, Completion Date, Description → Save → status "Past", added to the portfolio
 *              → "Past IDP Created Successfully"
 * Alternate:   "Please fill in all required fields."; Cancel;
 *              "Validation failed." (e.g. a completion date in the future, as in the wireframe)
 */
class CreatePastIDPPage {
  constructor(session) {
    this.session = session;
    this.controller = new CreatePastIDPController();
    this.form = UI.el('idp-form');
  }

  displayPage() {
    // The date picker itself also stops future dates; the controller still checks (typed or pasted values).
    UI.el('completionDate').max = DateUtil.todayKey();
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('name').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.createPastIDP(this.session.accountId, v.name, v.description, v.completionDate);
    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (result.message === 'Please fill in all required fields.') UI.showBanner('error', UI.escape(result.message));
    UI.showFieldErrors(this.form, result.fields, result.reasons);
  }

  displaySuccess(result) {
    UI.setFlash('success', `${result.message} — “${result.project.getProjectName()}” is now in your portfolio.`);
    location.href = `past-idps.html?new=${encodeURIComponent(result.project.getId())}`;
  }
}

Layout.start(session => new CreatePastIDPPage(session).displayPage());
