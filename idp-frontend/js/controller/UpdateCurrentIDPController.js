/*
 * Update Current IDP
 * UpdateCurrentIDPPage → UpdateCurrentIDPController.updateCurrentIDP(accountId, projectId, name, description, specifications)
 *   → Project
 * Normal flow: "Update IDP" → edit Name, Description, Specifications → Save → "IDP Updated Successfully"
 * Alternate:   "Please fill in all required fields."; Cancel; "Validation failed."
 * Customer and Start Date are shown read-only (not editable in this use case).
 */
class UpdateCurrentIDPController {
  getCurrentIDP(accountId, projectId) {
    const project = Project.findOwned(accountId, projectId, Project.CURRENT);
    if (!project) return Result.fail('IDP not found.');
    return Result.ok('', { project });
  }

  updateCurrentIDP(accountId, projectId, name, description, specifications) {
    const project = Project.findOwned(accountId, projectId, Project.CURRENT);
    if (!project) return Result.fail('IDP not found.');

    name = String(name ?? '').trim();
    description = String(description ?? '').trim();
    const specLines = IDPRules.toLines(specifications);

    const empty = Object.entries({ name, description, specifications: specLines.join('') })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    const invalid = IDPRules.checkName(accountId, name, project.getId())
      || IDPRules.checkDescription(description)
      || IDPRules.checkSpecifications(specLines);
    if (invalid) return invalid;

    project.setProjectName(name);
    project.setDescription(description);
    project.setSpecifications(specLines.join('\n'));
    project.save();

    ActivityLog.record('Interior Designer', 'Updated IDP', name);
    return Result.ok('IDP Updated Successfully', { project });
  }
}
