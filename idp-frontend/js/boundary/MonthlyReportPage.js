/*
 * Boundary: MonthlyReportPage
 * Normal flow: Generate Monthly Report → past month's traffic, sales, employee activity
 * Alternate:   "No data available for this month."; Download as PDF / CSV
 */
class MonthlyReportPage extends ReportPanel {
  constructor() {
    super('panel-monthly', 'month', GenerateMonthlyReportController.currentMonthKey(),
      'Choose a month, then click Generate Monthly Report.');
    this.controller = new GenerateMonthlyReportController();
  }

  run(monthKey) {
    return this.controller.generateMonthlyReport(monthKey);
  }

  render(r) {
    const weeks = r.byWeek.map(w => ({
      label: w.label + (w.partial ? '*' : ''),
      value: w.views,
      tip: `${w.label}${w.partial ? ' (partial week)' : ''} · ${UI.num(w.views)} views`
    }));
    const dash = v => (v === null ? '<span class="muted-cell">—</span>' : UI.num(v));
    const staff = r.staff.map(s => `
      <tr>
        <td>${UI.escape(s.username)}</td><td>${UI.escape(s.role)}</td>
        <td>${UI.num(s.actions)}</td><td>${dash(s.projectsCreated)}</td><td>${dash(s.viewsOnIDPs)}</td>
      </tr>`).join('') || `<tr><td colspan="5" class="empty">No staff activity this month.</td></tr>`;

    return `
      <h2 class="report-title">Monthly report · ${UI.escape(r.title)}</h2>
      <div class="stats">
        ${UI.statTile('Platform views', r.platformViews)}
        ${UI.statTile('Shortlists added', r.shortlistsAdded)}
        ${UI.statTile('Projects started', r.projectsStarted)}
        ${UI.statTile('Sales', 'Not tracked', 'The platform has no sales data yet')}
      </div>
      ${UI.columnChart(weeks, { caption: 'Traffic by week' })}
      ${r.byWeek.some(w => w.partial) ? '<p class="hint" style="margin:-8px 0 18px">* Partial week (cut by the start or end of the month).</p>' : ''}
      <p class="section-label">Employee activity</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Staff</th><th>Role</th><th>Actions</th><th>Projects created</th><th>Views on their IDPs</th></tr></thead>
          <tbody>${staff}</tbody>
        </table>
      </div>`;
  }

  csvName(r) {
    return `idp-monthly-report-${r.monthKey}.csv`;
  }

  csvRows(r) {
    return [
      ['IDP Platform — Monthly report', r.monthKey],
      [],
      ['Platform views', r.platformViews],
      ['Shortlists added', r.shortlistsAdded],
      ['Projects started', r.projectsStarted],
      ['Sales', 'Not tracked'],
      [],
      ['Week', 'Views', 'Partial week'],
      ...r.byWeek.map(w => [w.label, w.views, w.partial ? 'yes' : 'no']),
      [],
      ['Staff', 'Role', 'Actions', 'Projects created', 'Views on their IDPs'],
      ...r.staff.map(s => [s.username, s.role, s.actions, s.projectsCreated ?? '', s.viewsOnIDPs ?? ''])
    ];
  }
}
