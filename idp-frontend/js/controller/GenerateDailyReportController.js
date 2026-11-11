/*
 * Daily Report
 * ReportsPage (Daily tab) → GenerateDailyReportController.generateDailyReport(dayKey)
 *   → ProjectView, Shortlist, Project
 * Today's views and traffic, aggregated. Alternate: "No data available for today."
 */
class GenerateDailyReportController {
  generateDailyReport(dayKey = DateUtil.todayKey()) {
    const day = DateUtil.fromKey(dayKey);
    if (!day) return Result.fieldError('day', 'Please choose a valid date.');

    const start = day;
    const end = DateUtil.addDays(day, 1);
    const isToday = dayKey === DateUtil.todayKey();

    const views = ProjectView.findBetween(start, end);
    const saves = Shortlist.findAll().filter(s => DateUtil.within(s.getSavedAt(), start, end));

    if (!views.length && !saves.length) {
      return Result.fail(`No data available for ${isToday ? 'today' : DateUtil.label(day)}.`, {}, { dayKey });
    }

    // Views by hour of day (local time)
    const byHour = Array(24).fill(0);
    for (const v of views) byHour[new Date(v.getViewedAt()).getHours()]++;

    // Most viewed projects today
    const perProject = {};
    for (const v of views) {
      const p = (perProject[v.getProjectId()] ??= { views: 0, shortlisted: 0 });
      p.views++;
    }
    for (const s of saves) {
      const p = (perProject[s.getProjectId()] ??= { views: 0, shortlisted: 0 });
      p.shortlisted++;
    }
    const topProjects = Object.entries(perProject)
      .map(([id, n]) => {
        const project = Project.findById(id);
        return {
          name: project ? project.getProjectName() : 'Removed project',
          designer: project ? project.getDesignerName() || '—' : '—',
          ...n
        };
      })
      .sort((a, b) => b.views - a.views || b.shortlisted - a.shortlisted)
      .slice(0, 5);

    return Result.ok('', {
      dayKey,
      title: isToday ? `Today · ${DateUtil.label(day)}` : DateUtil.label(day),
      pageViews: views.length,
      uniqueVisitors: new Set(views.map(v => v.getVisitorId())).size,
      shortlistsAdded: saves.length,
      byHour,
      topProjects
    });
  }
}
