/*
 * View IDP
 * ViewIDPPage → ViewIDPController.viewIDP(accountId, projectId) → Project, Shortlist
 * Read-only details, images and progress. Alternate: "Project not found or has been removed."
 */
class ViewIDPController {
  viewIDP(accountId, projectId) {
    const project = Project.findById(projectId);
    if (!project || !project.isVisibleToCustomers()) {
      return Result.fail('Project not found or has been removed.');
    }
    // Counted by Portfolio Analytics and the reports.
    ProjectView.record(project.getId(), accountId);

    return Result.ok('', {
      project,
      designer: project.getDesignerName(),
      inShortlist: Shortlist.exists(accountId, project.getId())
    });
  }
}
