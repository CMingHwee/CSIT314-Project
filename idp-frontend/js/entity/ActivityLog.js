/*
 * Entity: ActivityLog — the modification log shown in the Weekly and Monthly reports.
 * One row of data/activity_log.csv. Controllers that change data call ActivityLog.record(...).
 */
class ActivityLog {
  static TABLE = 'activity_log';

  #id; #timestamp; #accountId; #username; #role; #action; #item;

  constructor({ id = '', timestamp = '', accountId = '', username = '', role = '', action = '', item = '' } = {}) {
    this.#id = String(id);
    this.#timestamp = timestamp || new Date().toISOString();
    this.#accountId = String(accountId);
    this.#username = username;
    this.#role = role;
    this.#action = action;
    this.#item = item;
  }

  getId() { return this.#id; }
  getTimestamp() { return this.#timestamp; }
  getAccountId() { return this.#accountId; }
  getUsername() { return this.#username; }
  getRole() { return this.#role; }
  getAction() { return this.#action; }
  getItem() { return this.#item; }

  toRecord() {
    return {
      id: this.#id, timestamp: this.#timestamp, accountId: this.#accountId,
      username: this.#username, role: this.#role, action: this.#action, item: this.#item
    };
  }

  /*
   * Logs a change. role is the role of the person doing it; the user comes from the session
   * when it matches. (User Admin pages are not behind a login yet, so a change made
   * there without logging in is recorded with username "—".)
   */
  static record(role, action, item) {
    if (!CsvStore.isLoaded(ActivityLog.TABLE)) return null;
    const s = typeof Session !== 'undefined' ? Session.current() : null;
    const actor = s && s.role === role ? s : null;
    const entry = new ActivityLog({
      accountId: actor ? actor.accountId : '',
      username: actor ? actor.username : '—',
      role,
      action,
      item
    });
    const rows = CsvStore.rows(ActivityLog.TABLE);
    entry.#id = CsvStore.nextId(ActivityLog.TABLE);
    rows.push(entry.toRecord());
    CsvStore.write(ActivityLog.TABLE, rows);
    return entry;
  }

  static findAll() {
    return CsvStore.rows(ActivityLog.TABLE).map(r => new ActivityLog(r));
  }

  // Newest first.
  static findBetween(start, end) {
    return ActivityLog.findAll()
      .filter(e => DateUtil.within(e.getTimestamp(), start, end))
      .sort((a, b) => b.getTimestamp().localeCompare(a.getTimestamp()));
  }
}
