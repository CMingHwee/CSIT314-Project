/*
 * Weekly Report
 * ReportsPage (Weekly tab) → GenerateWeeklyReportController.generateWeeklyReport(endDayKey)
 *   → ProjectView, Shortlist, ActivityLog
 * Past 7 days: view trend plus the modification log by Interior Designers and User Admins.
 * Alternate: "No data available for this week."
 */
class GenerateWeeklyReportController {
  // endDayKey is the last day of the 7-day window (default: today).
  generateWeeklyReport(endDayKey = DateUtil.todayKey()) {
    const last = DateUtil.fromKey(endDayKey);
    if (!last) return Result.fieldError('week', 'Please choose a valid date.');

    const start = DateUtil.addDays(last, -6);
    const end = DateUtil.addDays(last, 1);
    const prevStart = DateUtil.addDays(start, -7);

    const views = ProjectView.findBetween(start, end);
    const prevViews = ProjectView.findBetween(prevStart, start).length;
    const shortlists = Shortlist.findAll();
    const saves = shortlists.filter(s => DateUtil.within(s.getSavedAt(), start, end)).length;
    const prevSaves = shortlists.filter(s => DateUtil.within(s.getSavedAt(), prevStart, start)).length;
    const modifications = ActivityLog.findBetween(start, end)
      .filter(e => e.getRole() === 'Interior Designer' || e.getRole() === 'User Admin');

    if (!views.length && !saves && !modifications.length) {
      return Result.fail('No data available for this week.', {}, { endDayKey });
    }

    // View trend: one entry per day
    const byDay = [];
    for (let i = 0; i < 7; i++) {
      const d = DateUtil.addDays(start, i);
      const next = DateUtil.addDays(d, 1);
      byDay.push({
        label: DateUtil.DAY_NAMES[d.getDay()],
        dayKey: DateUtil.toKey(d),
        views: views.filter(v => DateUtil.within(v.getViewedAt(), d, next)).length
      });
    }

    return Result.ok('', {
      endDayKey,
      title: `${DateUtil.label(start)} – ${DateUtil.label(last)}`,
      views: views.length,
      viewsChange: percentChange(views.length, prevViews),
      shortlistsAdded: saves,
      shortlistsChange: percentChange(saves, prevSaves),
      modificationCount: modifications.length,
      byDay,
      modifications
    });

    function percentChange(now, before) {
      return before ? Math.round(((now - before) / before) * 100) : null;
    }
  }
}
