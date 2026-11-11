/*
 * Boundary: WeeklyReportPage
 * Normal flow: Generate Weekly Report → past 7 days view trend + modification log (designers & admins)
 * Alternate:   "No data available for this week."; Download as PDF / CSV
 */
class WeeklyReportPage extends ReportPanel {
  static LOG_ROWS = 10;

  constructor() {
    super('panel-weekly', 'week', DateUtil.todayKey(), 'Choose the last day of the week, then click Generate Weekly Report.');
    this.controller = new GenerateWeeklyReportController();
  }

  run(endDayKey) {
    return this.controller.generateWeeklyReport(endDayKey);
  }

  render(r) {
    const days = r.byDay.map(d => {
      const date = DateUtil.fromKey(d.dayKey);
      return {
        label: `${d.label} ${date.getDate()}`,
        value: d.views,
        tip: `${d.label} ${DateUtil.label(date)} · ${UI.num(d.views)} views`
      };
    });

    const shown = r.modifications.slice(0, WeeklyReportPage.LOG_ROWS);
    const log = shown.map(e => {
      const t = new Date(e.getTimestamp());
      return `
        <tr>
          <td style="white-space:nowrap">${t.getDate()} ${DateUtil.MONTH_NAMES[t.getMonth()]}, ${DateUtil.pad(t.getHours())}:${DateUtil.pad(t.getMinutes())}</td>
          <td>${UI.escape(e.getUsername())}</td>
          <td>${UI.escape(e.getRole())}</td>
          <td>${UI.escape(e.getAction())}</td>
          <td>${UI.escape(e.getItem())}</td>
        </tr>`;
    }).join('') || `<tr><td colspan="5" class="empty">No modifications this week.</td></tr>`;

    const logTitle = r.modificationCount > shown.length
      ? `Modification log · showing ${shown.length} of ${r.modificationCount} (all in CSV)`
      : `Modification log · ${r.modificationCount}`;

    return `
      <h2 class="report-title">Weekly report · ${UI.escape(r.title)}</h2>
      <div class="stats">
        ${UI.statTile('Views this week', r.views, UI.changeNote(r.viewsChange, 'week'))}
        ${UI.statTile('Shortlists added', r.shortlistsAdded, UI.changeNote(r.shortlistsChange, 'week'))}
        ${UI.statTile('Modifications logged', r.modificationCount, 'by designers & admins')}
      </div>
      ${UI.columnChart(days, { caption: 'View trend · past 7 days' })}
      <p class="section-label">${UI.escape(logTitle)}</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>When</th><th>User</th><th>Role</th><th>Action</th><th>Item</th></tr></thead>
          <tbody>${log}</tbody>
        </table>
      </div>`;
  }

  csvName(r) {
    return `idp-weekly-report-${r.byDay[0].dayKey}-to-${r.endDayKey}.csv`;
  }

  csvRows(r) {
    return [
      ['IDP Platform — Weekly report', `${r.byDay[0].dayKey} to ${r.endDayKey}`],
      [],
      ['Views this week', r.views, r.viewsChange === null ? '' : `${r.viewsChange}% vs week before`],
      ['Shortlists added', r.shortlistsAdded, r.shortlistsChange === null ? '' : `${r.shortlistsChange}% vs week before`],
      ['Modifications logged', r.modificationCount],
      [],
      ['Day', 'Date', 'Views'],
      ...r.byDay.map(d => [d.label, d.dayKey, d.views]),
      [],
      ['When (UTC)', 'User', 'Role', 'Action', 'Item'],
      ...r.modifications.map(e => [e.getTimestamp(), e.getUsername(), e.getRole(), e.getAction(), e.getItem()])
    ];
  }
}
