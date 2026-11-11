/*
 * Create Current IDP
 * CreateCurrentProjectPage → CreateCurrentProjectController.createCurrentProject(...) → Project
 * Precondition: the designer has company information.
 * The category (managed by Platform Management) is optional.
 */
class CreateCurrentProjectController {
  checkPrecondition(accountId) {
    if (!CompanyInfo.findByAccountId(accountId)) {
      return Result.fail('Create your company information before adding projects.');
    }
    return Result.ok('');
  }

  // For the optional Category dropdown.
  getCategories() {
    return typeof Category !== 'undefined' && CsvStore.isLoaded(Category.TABLE) ? Category.findAll() : [];
  }

  createCurrentProject(accountId, projectName, customerName, startDate, description, categoryId = '') {
    const pre = this.checkPrecondition(accountId);
    if (!pre.success) return pre;

    projectName = String(projectName ?? '').trim();
    customerName = String(customerName ?? '').trim();
    startDate = String(startDate ?? '').trim();
    description = String(description ?? '').trim();
    categoryId = String(categoryId ?? '').trim();

    const empty = Object.entries({ projectName, customerName, startDate, description })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    if (!Validation.isDate(startDate)) {
      return Result.fieldError('startDate', 'Please enter a valid date.');
    }
    if (categoryId && !this.getCategories().some(c => c.getId() === categoryId)) {
      return Result.fieldError('categoryId', 'Please choose a category from the list.');
    }

    // Status is set by the system, not the designer.
    const project = new Project({
      accountId, projectName, customerName, startDate, description,
      status: Project.CURRENT, progress: 0, categoryId
    }).save();

    ActivityLog.record('Interior Designer', 'Created current IDP', projectName);
    return Result.ok('Project Created Successfully', { project });
  }
}
