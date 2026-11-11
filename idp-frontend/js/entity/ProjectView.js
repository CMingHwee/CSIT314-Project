/*
 * Entity: ProjectView — one customer opening one project page.
 * One row of data/project_views.csv. Counted by Portfolio Analytics and the reports.
 * visitorId is "a<accountId>" for logged-in customers; seed data uses anonymous ids like "v123".
 */
class ProjectView {
  static TABLE = 'project_views';

  #id; #projectId; #visitorId; #viewedAt;

  constructor({ id = '', projectId = '', visitorId = '', viewedAt = '' } = {}) {
    this.#id = String(id);
    this.#projectId = String(projectId);
    this.#visitorId = String(visitorId);
    this.#viewedAt = viewedAt || new Date().toISOString();
  }

  getId() { return this.#id; }
  getProjectId() { return this.#projectId; }
  getVisitorId() { return this.#visitorId; }
  getViewedAt() { return this.#viewedAt; }

  toRecord() {
    return { id: this.#id, projectId: this.#projectId, visitorId: this.#visitorId, viewedAt: this.#viewedAt };
  }

  // Views are only ever added, never edited, so append without searching.
  save() {
    const rows = CsvStore.rows(ProjectView.TABLE);
    this.#id = CsvStore.nextId(ProjectView.TABLE);
    rows.push(this.toRecord());
    CsvStore.write(ProjectView.TABLE, rows);
    return this;
  }

  // Records a view if the page loaded the views table (it is skipped quietly otherwise).
  static record(projectId, accountId) {
    if (!CsvStore.isLoaded(ProjectView.TABLE)) return null;
    return new ProjectView({ projectId, visitorId: `a${accountId}` }).save();
  }

  static findAll() {
    return CsvStore.rows(ProjectView.TABLE).map(r => new ProjectView(r));
  }

  static findBetween(start, end) {
    return ProjectView.findAll().filter(v => DateUtil.within(v.getViewedAt(), start, end));
  }

  // { projectId: count } over all time.
  static countByProject() {
    const counts = {};
    for (const r of CsvStore.rows(ProjectView.TABLE)) counts[r.projectId] = (counts[r.projectId] || 0) + 1;
    return counts;
  }
}
