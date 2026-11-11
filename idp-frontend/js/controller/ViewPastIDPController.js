/*
 * View Past IDP
 * ViewPastIDPPage → ViewPastIDPController.viewPastIDP(accountId, projectId) → Project
 * Normal flow: Past IDPs → select → "View IDP" → details
 * Alternate:   "IDP not found."
 */
class ViewPastIDPController {
  viewPastIDP(accountId, projectId) {
    const project = Project.findOwned(accountId, projectId, Project.PAST);
    if (!project) return Result.fail('IDP not found.');
    return Result.ok('', { project });
  }
}
