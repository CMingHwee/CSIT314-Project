/*
 * Boundary: CreateCurrentProjectPage
 * Precondition: the designer has company information.
 * Normal flow: Project Name, Customer Name, Start Date, Description → Save
 *              → status set to "Current" → "Project Created Successfully" → My Projects
 * Alternate:   "Please fill in all required fields."; Cancel
 */
class CreateCurrentProjectPage {
  constructor(session) {
    this.session = session;
    this.controller = new CreateCurrentProjectController();
    this.form = UI.el('project-form');
  }

  displayPage() {
    const pre = this.controller.checkPrecondition(this.session.accountId);
    if (!pre.success) {
      UI.showBanner('error', `${UI.escape(pre.message)} <a href="create-company.html">Create Company Info</a>`);
      return;
    }
    UI.el('categoryId').innerHTML = `<option value="">No category</option>` +
      this.controller.getCategories()
        .map(c => `<option value="${UI.escape(c.getId())}">${UI.escape(c.getName())}</option>`).join('');

    this.form.hidden = false;
    this.form.addEventListener('submit', e => this.onSubmit(e));
    UI.el('projectName').focus();
  }

  onSubmit(e) {
    e.preventDefault();
    UI.clearBanner();
    UI.clearFieldErrors(this.form);

    const v = UI.formValues(this.form);
    const result = this.controller.createCurrentProject(
      this.session.accountId, v.projectName, v.customerName, v.startDate, v.description, v.categoryId);

    if (result.success) this.displaySuccess(result);
    else this.displayError(result);
  }

  displayError(result) {
    if (!Object.keys(result.fields).length) {
      UI.showBanner('error', UI.escape(result.message));
    }
    // Wireframe: "Please fill in all required fields." under each empty field.
    const fields = { ...result.fields };
    if (result.message === 'Please fill in all required fields.') {
      for (const k of Object.keys(fields)) fields[k] = result.message;
    }
    UI.showFieldErrors(this.form, fields);
  }

  displaySuccess(result) {
    UI.setFlash('success', `${result.message} — “${result.project.getProjectName()}” is now Current.`);
    location.href = `my-projects.html?new=${encodeURIComponent(result.project.getId())}`;
  }
}

Layout.start(session => new CreateCurrentProjectPage(session).displayPage());
