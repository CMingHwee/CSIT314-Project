/*
 * View Current IDP
 * ViewCurrentIDPPage → ViewCurrentIDPController.viewCurrentIDP(accountId, projectId) → Project
 * Normal flow: Current IDPs → select → "View IDP" → details and progress
 * Alternate:   "IDP not found."
 */
class ViewCurrentIDPController {
  viewCurrentIDP(accountId, projectId) {
    const project = Project.findOwned(accountId, projectId, Project.CURRENT);
    if (!project) return Result.fail('IDP not found.');
    return Result.ok('', { project });
  }
}
