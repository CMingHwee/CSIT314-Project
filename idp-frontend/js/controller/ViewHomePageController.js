/*
 * Homepage (not a user story) — the public front page at index.html.
 * HomePage → ViewHomePageController → Project, CompanyInfo, UserAccount, UserProfile, Shortlist, ProjectView, Category
 * Everything shown here is something customers are allowed to see (Project.isVisibleToCustomers()).
 */
class ViewHomePageController {
  // Completed (past) IDPs, most recently completed first.
  getCompletedProjects(limit = 6, categoryId = '') {
    const all = Project.findVisible()
      .filter(p => p.isPast() && (!categoryId || p.getCategoryId() === String(categoryId)))
      .sort((a, b) => b.getSortDate().localeCompare(a.getSortDate()));
    return Result.ok('', {
      items: all.slice(0, limit),
      total: all.length,
      category: categoryId ? Category.findById(categoryId) : null
    });
  }

  /*
   * "The best" Interior Designers: ranked by how many times customers shortlisted their projects,
   * then by how many times their projects were viewed. Only designers customers can see are ranked.
   */
  getTopDesigners(limit = 5) {
    const views = ProjectView.countByProject();
    const saves = {};
    for (const s of Shortlist.findAll()) saves[s.getProjectId()] = (saves[s.getProjectId()] || 0) + 1;

    const visible = Project.findVisible();
    const byDesigner = new Map();
    for (const p of visible) {
      const d = byDesigner.get(p.getAccountId()) || { completed: 0, current: 0, shortlisted: 0, views: 0 };
      if (p.isPast()) d.completed++; else d.current++;
      d.shortlisted += saves[p.getId()] || 0;
      d.views += views[p.getId()] || 0;
      byDesigner.set(p.getAccountId(), d);
    }

    const rows = [...byDesigner.entries()].map(([accountId, stats]) => {
      const company = CompanyInfo.findByAccountId(accountId);
      const profile = UserProfile.findByAccountId(accountId);
      const account = UserAccount.findById(accountId);
      return {
        accountId,
        company: company ? company.getCompanyName() : '',
        description: company ? company.getDescription() : '',
        designer: profile ? profile.getFullName() : (account ? account.getUsername() : ''),
        photo: profile ? profile.getPhoto() : '',
        location: profile ? profile.getLocation() : '',
        ...stats
      };
    }).sort((a, b) => b.shortlisted - a.shortlisted || b.views - a.views);

    rows.forEach((r, i) => { r.rank = i + 1; });
    return Result.ok('', { rows: rows.slice(0, limit), total: rows.length });
  }

  // The numbers in the "at a glance" strip.
  getPlatformStats() {
    const visible = Project.findVisible();
    const designers = new Set(visible.map(p => p.getAccountId()));
    const visibleIds = new Set(visible.map(p => p.getId()));
    return Result.ok('', {
      completedProjects: visible.filter(p => p.isPast()).length,
      currentProjects: visible.filter(p => p.isCurrent()).length,
      designers: designers.size,
      timesShortlisted: Shortlist.findAll().filter(s => visibleIds.has(s.getProjectId())).length
    });
  }

  // Categories with how many completed projects each has (for the left bar).
  getCategories() {
    const completed = Project.findVisible().filter(p => p.isPast());
    const rows = Category.findAll().map(c => ({
      category: c,
      completed: completed.filter(p => p.getCategoryId() === c.getId()).length
    }));
    return Result.ok('', { rows });
  }
}
