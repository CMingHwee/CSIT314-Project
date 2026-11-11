/*
 * Entity: Project (an Interior Design Project, IDP)
 * One row of data/projects.csv, owned by an Interior Designer account.
 */
class Project {
  static TABLE = 'projects';
  static CURRENT = 'Current';
  static PAST = 'Past';

  #id; #accountId; #projectName; #customerName; #startDate; #description; #status; #progress; #categoryId; #specifications; #progressNote; #completionDate; #images;

  constructor({ id = '', accountId = '', projectName = '', customerName = '', startDate = '', description = '', status = Project.CURRENT, progress = '0', categoryId = '',
               specifications = '', progressNote = '', completionDate = '', images = '' } = {}) {
    this.#id = String(id);
    this.#accountId = String(accountId);
    this.#projectName = projectName;
    this.#customerName = customerName;
    this.#startDate = startDate;          // YYYY-MM-DD
    this.#description = description;
    this.#status = status || Project.CURRENT;
    this.#progress = Math.max(0, Math.min(100, Number(progress) || 0));   // percent complete
    this.#categoryId = String(categoryId ?? '');                          // '' = no category
    this.#specifications = specifications;   // one item per line
    this.#progressNote = progressNote;       // e.g. "design approved, carpentry next"
    this.#completionDate = completionDate;   // YYYY-MM-DD, past IDPs
    this.#images = images;                   // file names in images/projects/, separated by |
  }

  getId() { return this.#id; }
  getAccountId() { return this.#accountId; }
  getProjectName() { return this.#projectName; }
  getCustomerName() { return this.#customerName; }
  getStartDate() { return this.#startDate; }
  getDescription() { return this.#description; }
  getStatus() { return this.#status; }
  getProgress() { return this.#progress; }
  getCategoryId() { return this.#categoryId; }
  getSpecifications() { return this.#specifications; }
  getProgressNote() { return this.#progressNote; }
  getCompletionDate() { return this.#completionDate; }

  // Picture paths, e.g. ["images/projects/kitchen-1.jpg", …]. The first one is the cover image.
  getImages() {
    return String(this.#images || '').split('|').map(s => s.trim()).filter(Boolean)
      .map(f => (/^(https?:|data:|images\/)/.test(f) ? f : `images/projects/${f}`));
  }
  isCurrent() { return this.#status === Project.CURRENT; }
  isPast() { return this.#status === Project.PAST; }

  // Specifications as a list of non-empty lines.
  getSpecificationList() {
    return String(this.#specifications).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  // Date used for ordering: completion date for past IDPs, start date for current ones.
  getSortDate() {
    return this.isPast()
      ? this.#completionDate || this.#startDate || ''
      : this.#startDate || this.#completionDate || '';
  }

  // Category name, or '' if none (or the categories table is not loaded on this page).
  getCategoryName() {
    if (!this.#categoryId || typeof Category === 'undefined' || !CsvStore.isLoaded(Category.TABLE)) return '';
    const c = Category.findById(this.#categoryId);
    return c ? c.getName() : '';
  }

  setProjectName(v) { this.#projectName = v; }
  setCustomerName(v) { this.#customerName = v; }
  setStartDate(v) { this.#startDate = v; }
  setDescription(v) { this.#description = v; }
  setStatus(v) { this.#status = v; }
  setProgress(v) { this.#progress = Math.max(0, Math.min(100, Number(v) || 0)); }
  setCategoryId(v) { this.#categoryId = String(v ?? ''); }
  setSpecifications(v) { this.#specifications = v; }
  setProgressNote(v) { this.#progressNote = v; }
  setCompletionDate(v) { this.#completionDate = v; }

  toRecord() {
    return {
      id: this.#id,
      accountId: this.#accountId,
      projectName: this.#projectName,
      customerName: this.#customerName,
      startDate: this.#startDate,
      description: this.#description,
      status: this.#status,
      progress: String(this.#progress),
      categoryId: this.#categoryId,
      specifications: this.#specifications,
      progressNote: this.#progressNote,
      completionDate: this.#completionDate,
      images: this.#images
    };
  }

  save() {
    const rows = CsvStore.rows(Project.TABLE);
    if (!this.#id) this.#id = CsvStore.nextId(Project.TABLE);
    const i = rows.findIndex(r => String(r.id) === this.#id);
    if (i >= 0) rows[i] = this.toRecord();
    else rows.push(this.toRecord());
    CsvStore.write(Project.TABLE, rows);
    return this;
  }

  // Returns true if the row was removed and saved. On failure the data is left unchanged.
  delete() {
    const before = CsvStore.rows(Project.TABLE);
    const after = before.filter(r => String(r.id) !== this.#id);
    if (after.length === before.length) return false;
    const ok = CsvStore.write(Project.TABLE, after);
    if (!ok) CsvStore.write(Project.TABLE, before);
    return ok;
  }

  /*
   * Customers only see a project when its designer has company information (Delete Company Info postcondition),
   * the designer's account is active, and the designer's profile is not suspended
   * (a suspended profile no longer appears in public search).
   */
  isVisibleToCustomers() {
    if (!CompanyInfo.findByAccountId(this.#accountId)) return false;
    const designer = UserAccount.findById(this.#accountId);
    if (designer === null || !designer.isActive()) return false;
    if (typeof UserProfile !== 'undefined' && CsvStore.isLoaded(UserProfile.TABLE)) {
      const profile = UserProfile.findByAccountId(this.#accountId);
      if (profile && profile.isSuspended()) return false;
    }
    return true;
  }

  // The designer's profile photo path ('' if none, or if profiles aren't loaded on this page).
  getDesignerPhoto() {
    if (typeof UserProfile === 'undefined' || !CsvStore.isLoaded(UserProfile.TABLE)) return '';
    const profile = UserProfile.findByAccountId(this.#accountId);
    return profile ? profile.getPhoto() : '';
  }

  // Company name shown as "Designer" on customer pages.
  getDesignerName() {
    const company = CompanyInfo.findByAccountId(this.#accountId);
    return company ? company.getCompanyName() : '';
  }

  static findAll() {
    return CsvStore.rows(Project.TABLE).map(r => new Project(r));
  }

  static findById(id) {
    return Project.findAll().find(p => p.getId() === String(id)) || null;
  }

  // Newest start date first.
  static findByAccountId(accountId) {
    return Project.findAll()
      .filter(p => p.getAccountId() === String(accountId))
      .sort((a, b) => b.getSortDate().localeCompare(a.getSortDate()));
  }

  // One of the designer's own IDPs with the given status, or null (→ "IDP not found.").
  static findOwned(accountId, projectId, status) {
    const p = Project.findById(projectId);
    return p && p.getAccountId() === String(accountId) && p.getStatus() === status ? p : null;
  }

  // Does this designer already have another IDP with this name? (case-insensitive)
  static isNameTakenBy(accountId, name, excludeId = null) {
    const n = String(name).trim().toLowerCase();
    return Project.findByAccountId(accountId).some(p =>
      (excludeId === null || p.getId() !== String(excludeId)) && p.getProjectName().toLowerCase() === n);
  }

  // A designer's own IDPs with one status. Newest first.
  static findByAccountAndStatus(accountId, status) {
    return Project.findByAccountId(accountId).filter(p => p.getStatus() === status);
  }

  // Projects customers may browse: Current ones first, then newest start date.
  static findVisible() {
    return Project.findAll()
      .filter(p => p.isVisibleToCustomers())
      .sort((a, b) =>
        (a.getStatus() === Project.CURRENT ? 0 : 1) - (b.getStatus() === Project.CURRENT ? 0 : 1) ||
        b.getSortDate().localeCompare(a.getSortDate()));
  }

  // What a project card on a customer page needs.
  toCard() {
    return { project: this, projectId: this.#id, designer: this.getDesignerName(), available: true };
  }

  // Designer-side search: name, customer, description or specifications.
  matchesForDesigner(term) {
    const q = String(term).trim().toLowerCase();
    return [this.#projectName, this.#customerName, this.#description, this.#specifications]
      .some(v => String(v).toLowerCase().includes(q));
  }

  // Case-insensitive match on project name, description or designer (company) name.
  matches(term) {
    const q = String(term).trim().toLowerCase();
    return [this.#projectName, this.#description, this.getDesignerName()]
      .some(v => v.toLowerCase().includes(q));
  }
}
