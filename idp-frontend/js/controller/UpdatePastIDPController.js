/*
 * Update Past IDP
 * UpdatePastIDPPage → UpdatePastIDPController.updatePastIDP(accountId, projectId, name, description, completionDate)
 *   → Project
 * Normal flow: edit Name, Description, Completion Date → Save → "IDP Updated Successfully"
 * Alternate:   "Please fill in all required fields."; Cancel; "Validation failed."
 */
class UpdatePastIDPController {
  getPastIDP(accountId, projectId) {
    const project = Project.findOwned(accountId, projectId, Project.PAST);
    if (!project) return Result.fail('IDP not found.');
    return Result.ok('', { project });
  }

  updatePastIDP(accountId, projectId, name, description, completionDate) {
    const project = Project.findOwned(accountId, projectId, Project.PAST);
    if (!project) return Result.fail('IDP not found.');

    name = String(name ?? '').trim();
    description = String(description ?? '').trim();
    completionDate = String(completionDate ?? '').trim();

    const empty = Object.entries({ name, completionDate, description })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    const invalid = IDPRules.checkName(accountId, name, project.getId())
      || IDPRules.checkCompletionDate(completionDate)
      || IDPRules.checkDescription(description);
    if (invalid) return invalid;

    const previousDate = project.getCompletionDate();
    project.setProjectName(name);
    project.setDescription(description);
    project.setCompletionDate(completionDate);
    project.save();

    ActivityLog.record('Interior Designer', 'Updated past IDP', name);
    return Result.ok('IDP Updated Successfully', {
      project,
      dateCorrectedFrom: previousDate && previousDate !== completionDate ? previousDate : ''
    });
  }
}
