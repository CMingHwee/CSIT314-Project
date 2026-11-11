/*
 * Delete Current IDP (used when the project's contract has lapsed)
 * DeleteCurrentIDPPage (confirmation dialog) → DeleteCurrentIDPController.deleteCurrentIDP(accountId, projectId) → Project
 * Normal flow: "Delete IDP" → confirm → "IDP Deleted Successfully"
 * Alternate:   Cancel; "Deletion failed."
 * Customers who shortlisted it keep the card, marked "No longer available".
 */
class DeleteCurrentIDPController {
  deleteCurrentIDP(accountId, projectId) {
    const project = Project.findOwned(accountId, projectId, Project.CURRENT);
    if (!project) return Result.fail('IDP not found.');
    if (!project.delete()) return Result.fail('Deletion failed.');
    ActivityLog.record('Interior Designer', 'Deleted IDP', project.getProjectName());
    return Result.ok('IDP Deleted Successfully', { project, redirect: 'my-projects.html' });
  }
}
