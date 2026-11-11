/*
 * Boundary: PortfolioAnalyticsPage
 * Normal flow: Analytics section → own IDPs with View Count and Shortlist Count
 * Alternate:   "No projects available to analyze."
 */
class PortfolioAnalyticsPage {
  constructor(session) {
    this.session = session;
    this.controller = new ViewPortfolioAnalyticsController();
  }

  displayPage() {
    UI.el('sort').addEventListener('change', () => this.show(UI.el('sort').value));
    this.show('views');
  }

  show(sortBy) {
    const result = this.controller.getPortfolioAnalytics(this.session.accountId, sortBy);
    if (!result.success) {
      this.displayError(result);
      return;
    }

    UI.el('stats').innerHTML =
      UI.statTile('Total views', result.totalViews) +
      UI.statTile('Times shortlisted', result.totalShortlisted) +
      UI.statTile('Projects in portfolio', result.projectCount);

    // Each measure gets its own scale: views and shortlists are never drawn on one axis.
    const maxViews = Math.max(...result.rows.map(r => r.views), 1);
    const maxSaves = Math.max(...result.rows.map(r => r.shortlisted), 1);
    const bar = (v, max, label) => `
      <div class="hbar" title="${UI.escape(label)}">
        <b>${UI.num(v)}</b>
        <span class="track"><span class="fill" style="width:${(v / max) * 100}%"></span></span>
      </div>`;

    UI.el('analytics-body').innerHTML = result.rows.map(r => {
      const p = r.project;
      return `
        <tr>
          <td>${UI.escape(p.getProjectName())}</td>
          <td><span class="pill${p.getStatus() === Project.CURRENT ? '' : ' inactive'}">${UI.escape(p.getStatus())}</span></td>
          <td>${bar(r.views, maxViews, `${UI.num(r.views)} views`)}</td>
          <td>${bar(r.shortlisted, maxSaves, `Shortlisted ${UI.num(r.shortlisted)} times`)}</td>
        </tr>`;
    }).join('');

    UI.el('analytics').hidden = false;
  }

  displayError(result) {
    UI.el('no-projects-text').textContent = result.message;
    UI.el('no-projects').hidden = false;
  }
}

Layout.start(session => new PortfolioAnalyticsPage(session).displayPage());
