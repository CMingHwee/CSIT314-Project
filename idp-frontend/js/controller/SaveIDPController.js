/*
 * Save IDP to Shortlist
 * SaveIDPPage ("Save to Shortlist" button) → SaveIDPController.saveIDP(accountId, projectId) → Shortlist
 * Alternate: "Project is already in your shortlist."
 */
class SaveIDPController {
  saveIDP(accountId, projectId) {
    const project = Project.findById(projectId);
    if (!project || !project.isVisibleToCustomers()) {
      return Result.fail('Project not found or has been removed.');
    }

    // Check for duplicates
    if (Shortlist.exists(accountId, projectId)) {
      return Result.fail('Project is already in your shortlist.');
    }

    const entry = new Shortlist({ accountId, projectId: project.getId() }).save();
    return Result.ok('Added to Shortlist', { entry, project });
  }
}
