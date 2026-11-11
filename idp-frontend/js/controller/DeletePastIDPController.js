/*
 * Delete Past IDP (remove a project from the portfolio)
 * DeletePastIDPPage (confirmation dialog) → DeletePastIDPController.deletePastIDP(accountId, projectId) → Project
 * Normal flow: "Delete IDP" → confirm → "IDP Deleted Successfully"
 * Alternate:   Cancel; "Deletion failed."
 */
class DeletePastIDPController {
  deletePastIDP(accountId, projectId) {
    const project = Project.findOwned(accountId, projectId, Project.PAST);
    if (!project) return Result.fail('IDP not found.');
    if (!project.delete()) return Result.fail('Deletion failed.');
    ActivityLog.record('Interior Designer', 'Deleted past IDP', project.getProjectName());
    return Result.ok('IDP Deleted Successfully', { project, redirect: 'past-idps.html' });
  }
}
