/*
 * Create Past IDP
 * CreatePastIDPPage → CreatePastIDPController.createPastIDP(accountId, name, description, completionDate) → Project
 * Normal flow: "Create Past IDP" → Name, Description, Completion Date → Save
 *              → status set to "Past", added to the portfolio → "Past IDP Created Successfully"
 * Alternate:   "Please fill in all required fields."; Cancel; "Validation failed."
 */
class CreatePastIDPController {
  createPastIDP(accountId, name, description, completionDate) {
    name = String(name ?? '').trim();
    description = String(description ?? '').trim();
    completionDate = String(completionDate ?? '').trim();

    const empty = Object.entries({ name, completionDate, description })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    const invalid = IDPRules.checkName(accountId, name)
      || IDPRules.checkCompletionDate(completionDate)
      || IDPRules.checkDescription(description);
    if (invalid) return invalid;

    const project = new Project({
      accountId, projectName: name, description, completionDate,
      status: Project.PAST, progress: 100
    }).save();

    ActivityLog.record('Interior Designer', 'Created past IDP', name);
    return Result.ok('Past IDP Created Successfully', { project });
  }
}
