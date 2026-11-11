/*
 * Entity: Shortlist
 * One row of data/shortlists.csv: a customer saved a project to their shortlist.
 */
class Shortlist {
  static TABLE = 'shortlists';

  #id; #accountId; #projectId; #savedAt;

  constructor({ id = '', accountId = '', projectId = '', savedAt = '' } = {}) {
    this.#id = String(id);
    this.#accountId = String(accountId);
    this.#projectId = String(projectId);
    this.#savedAt = savedAt || new Date().toISOString();
  }

  getId() { return this.#id; }
  getAccountId() { return this.#accountId; }
  getProjectId() { return this.#projectId; }
  getSavedAt() { return this.#savedAt; }

  // The saved project, or null if it no longer exists.
  getProject() {
    return Project.findById(this.#projectId);
  }

  // Card data for the shortlist. A saved project that was later hidden or removed stays
  // in the list but is marked unavailable.
  toCard() {
    const project = this.getProject();
    return {
      entry: this,
      project,
      projectId: this.#projectId,
      designer: project ? project.getDesignerName() : '',
      available: project !== null && project.isVisibleToCustomers()
    };
  }

  toRecord() {
    return {
      id: this.#id,
      accountId: this.#accountId,
      projectId: this.#projectId,
      savedAt: this.#savedAt
    };
  }

  save() {
    const rows = CsvStore.rows(Shortlist.TABLE);
    if (!this.#id) this.#id = CsvStore.nextId(Shortlist.TABLE);
    const i = rows.findIndex(r => String(r.id) === this.#id);
    if (i >= 0) rows[i] = this.toRecord();
    else rows.push(this.toRecord());
    CsvStore.write(Shortlist.TABLE, rows);
    return this;
  }

  static findAll() {
    return CsvStore.rows(Shortlist.TABLE).map(r => new Shortlist(r));
  }

  // Most recently saved first.
  static findByAccountId(accountId) {
    return Shortlist.findAll()
      .filter(s => s.getAccountId() === String(accountId))
      .sort((a, b) => b.getSavedAt().localeCompare(a.getSavedAt()));
  }

  static exists(accountId, projectId) {
    return Shortlist.findAll().some(s =>
      s.getAccountId() === String(accountId) && s.getProjectId() === String(projectId));
  }
}
