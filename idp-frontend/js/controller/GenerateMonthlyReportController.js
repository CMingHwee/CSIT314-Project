/*
 * Monthly Report
 * ReportsPage (Monthly tab) → GenerateMonthlyReportController.generateMonthlyReport(monthKey)
 *   → ProjectView, Shortlist, Project, ActivityLog, UserAccount
 * Past month's traffic, sales and employee activity. Alternate: "No data available for this month."
 *
 * Sales: the platform does not record any sales yet, so the report says so instead of inventing a number.
 */
class GenerateMonthlyReportController {
  static currentMonthKey() {
    return DateUtil.todayKey().slice(0, 7);
  }

  generateMonthlyReport(monthKey = GenerateMonthlyReportController.currentMonthKey()) {
    const range = DateUtil.monthRange(monthKey);
    if (!range) return Result.fieldError('month', 'Please choose a valid month.');
    const { start, end } = range;

    const views = ProjectView.findBetween(start, end);
    const saves = Shortlist.findAll().filter(s => DateUtil.within(s.getSavedAt(), start, end)).length;
    const log = ActivityLog.findBetween(start, end);
    const projectsStarted = Project.findAll().filter(p => p.getStartDate().startsWith(monthKey)).length;

    if (!views.length && !saves && !log.length) {
      return Result.fail('No data available for this month.', {}, { monthKey });
    }

    // Traffic by week (Monday–Sunday, cut at the month's edges; a cut week is marked partial)
    const byWeek = [];
    let wStart = new Date(start);
    while (wStart < end) {
      const daysToMonday = (8 - wStart.getDay()) % 7 || 7;
      let wEnd = DateUtil.addDays(wStart, daysToMonday);
      if (wEnd > end) wEnd = new Date(end);
      const lastDay = DateUtil.addDays(wEnd, -1);
      const days = Math.round((wEnd - wStart) / 86400000);
      byWeek.push({
        label: `${wStart.getDate()}–${lastDay.getDate()} ${DateUtil.MONTH_NAMES[wStart.getMonth()]}`,
        views: views.filter(v => DateUtil.within(v.getViewedAt(), wStart, wEnd)).length,
        partial: days < 7
      });
      wStart = wEnd;
    }

    // Employee activity: Interior Designers and User Admins
    const viewsByProject = {};
    for (const v of views) viewsByProject[v.getProjectId()] = (viewsByProject[v.getProjectId()] || 0) + 1;
    const projects = Project.findAll();

    const staff = UserAccount.findAll()
      .filter(a => a.getRole() === 'Interior Designer' || a.getRole() === 'User Admin')
      .map(a => {
        const mine = log.filter(e => e.getAccountId() === a.getId());
        const isDesigner = a.getRole() === 'Interior Designer';
        return {
          username: a.getUsername(),
          role: a.getRole(),
          actions: mine.length,
          projectsCreated: isDesigner ? mine.filter(e => e.getAction() === 'Created current IDP').length : null,
          viewsOnIDPs: isDesigner
            ? projects.filter(p => p.getAccountId() === a.getId()).reduce((n, p) => n + (viewsByProject[p.getId()] || 0), 0)
            : null
        };
      })
      .filter(s => s.actions > 0 || s.viewsOnIDPs > 0)
      .sort((a, b) => b.actions - a.actions || (b.viewsOnIDPs || 0) - (a.viewsOnIDPs || 0));

    return Result.ok('', {
      monthKey,
      title: `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'][start.getMonth()]} ${start.getFullYear()}`,
      platformViews: views.length,
      shortlistsAdded: saves,
      projectsStarted,
      sales: null,
      byWeek,
      staff
    });
  }
}
