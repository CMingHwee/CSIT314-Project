/*
 * Boundary: DailyReportPage
 * Normal flow: Reports → Generate Daily Report → today's views and traffic
 * Alternate:   "No data available for today."; Download as PDF / CSV
 */
class DailyReportPage extends ReportPanel {
  constructor() {
    super('panel-daily', 'day', DateUtil.todayKey(), 'Choose a day, then click Generate Daily Report.');
    this.controller = new GenerateDailyReportController();
  }

  run(dayKey) {
    return this.controller.generateDailyReport(dayKey);
  }

  render(r) {
    const hours = r.byHour.map((v, h) => ({
      label: DateUtil.pad(h),
      value: v,
      tip: `${DateUtil.pad(h)}:00–${DateUtil.pad(h)}:59 · ${UI.num(v)} views`
    }));
    const top = r.topProjects.map(p => `
      <tr><td>${UI.escape(p.name)}</td><td>${UI.escape(p.designer)}</td>
          <td>${UI.num(p.views)}</td><td>${UI.num(p.shortlisted)}</td></tr>`).join('');

    return `
      <h2 class="report-title">Daily report · ${UI.escape(r.title)}</h2>
      <div class="stats">
        ${UI.statTile('Page views', r.pageViews)}
        ${UI.statTile('Unique visitors', r.uniqueVisitors)}
        ${UI.statTile('Shortlists added', r.shortlistsAdded)}
      </div>
      ${UI.columnChart(hours, { caption: 'Views by time of day', labelEvery: 3 })}
      <p class="section-label">Most viewed projects</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Project</th><th>Designer</th><th>Views</th><th>Shortlisted</th></tr></thead>
          <tbody>${top}</tbody>
        </table>
      </div>`;
  }

  csvName(r) {
    return `idp-daily-report-${r.dayKey}.csv`;
  }

  csvRows(r) {
    return [
      ['IDP Platform — Daily report', r.dayKey],
      [],
      ['Page views', r.pageViews],
      ['Unique visitors', r.uniqueVisitors],
      ['Shortlists added', r.shortlistsAdded],
      [],
      ['Hour', 'Views'],
      ...r.byHour.map((v, h) => [`${DateUtil.pad(h)}:00`, v]),
      [],
      ['Most viewed project', 'Designer', 'Views', 'Shortlisted'],
      ...r.topProjects.map(p => [p.name, p.designer, p.views, p.shortlisted])
    ];
  }
}
