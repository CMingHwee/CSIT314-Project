/*
 * View IDP Analytics (views and shortlists)
 * PortfolioAnalyticsPage → ViewPortfolioAnalyticsController.getPortfolioAnalytics(accountId, sortBy)
 *   → Project, ProjectView, Shortlist
 * Lists the designer's own IDPs with View Count and Shortlist Count.
 * Alternate: "No projects available to analyze."
 */
class ViewPortfolioAnalyticsController {
  static SORTS = ['views', 'shortlisted'];

  getPortfolioAnalytics(accountId, sortBy = 'views') {
    const projects = Project.findByAccountId(accountId);
    if (!projects.length) return Result.fail('No projects available to analyze.');

    const views = ProjectView.countByProject();
    const saves = {};
    for (const s of Shortlist.findAll()) saves[s.getProjectId()] = (saves[s.getProjectId()] || 0) + 1;

    const rows = projects.map(p => ({
      project: p,
      views: views[p.getId()] || 0,
      shortlisted: saves[p.getId()] || 0
    }));

    const key = ViewPortfolioAnalyticsController.SORTS.includes(sortBy) ? sortBy : 'views';
    const other = key === 'views' ? 'shortlisted' : 'views';
    rows.sort((a, b) => b[key] - a[key] || b[other] - a[other]);

    return Result.ok('', {
      rows,
      sortBy: key,
      totalViews: rows.reduce((n, r) => n + r.views, 0),
      totalShortlisted: rows.reduce((n, r) => n + r.shortlisted, 0),
      projectCount: rows.length
    });
  }
}
