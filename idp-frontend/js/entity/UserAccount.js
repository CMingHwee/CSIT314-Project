/*
 * Entity: UserAccount
 * One row of data/user_accounts.csv. Private fields with getters/setters,
 * matching the userAccount class in the Python backend.
 */
class UserAccount {
  static TABLE = 'user_accounts';
  static ROLES = ['User Admin', 'Interior Designer', 'Customer', 'Platform Management'];
  static ACTIVE = 'Active';
  static INACTIVE = 'Inactive';

  #id; #username; #email; #phone; #password; #role; #status;

  constructor({ id = '', username = '', email = '', phone = '', password = '', role = '', status = UserAccount.ACTIVE } = {}) {
    this.#id = String(id);
    this.#username = username;
    this.#email = email;
    this.#phone = phone;
    this.#password = password;
    this.#role = role;
    this.#status = status || UserAccount.ACTIVE;
  }

  /* ---------- getters ---------- */
  getId() { return this.#id; }
  getUsername() { return this.#username; }
  getEmail() { return this.#email; }
  getPhone() { return this.#phone; }
  getPassword() { return this.#password; }
  getRole() { return this.#role; }
  getStatus() { return this.#status; }
  isActive() { return this.#status === UserAccount.ACTIVE; }

  /* ---------- setters ---------- */
  setUsername(v) { this.#username = v; }
  setEmail(v) { this.#email = v; }
  setPhone(v) { this.#phone = v; }
  setPassword(v) { this.#password = v; }
  setRole(v) { this.#role = v; }
  setStatus(v) { this.#status = v; }

  toRecord() {
    return {
      id: this.#id,
      username: this.#username,
      email: this.#email,
      phone: this.#phone,
      password: this.#password,
      role: this.#role,
      status: this.#status
    };
  }

  /* ---------- persistence ---------- */

  // Inserts a new row (gives it the next id) or replaces the row with the same id.
  save() {
    const rows = CsvStore.rows(UserAccount.TABLE);
    if (!this.#id) this.#id = CsvStore.nextId(UserAccount.TABLE);
    const i = rows.findIndex(r => String(r.id) === this.#id);
    if (i >= 0) rows[i] = this.toRecord();
    else rows.push(this.toRecord());
    CsvStore.write(UserAccount.TABLE, rows);
    return this;
  }

  // Suspension keeps the data and only changes the status, so it can be reversed.
  suspend() {
    this.#status = UserAccount.INACTIVE;
    return this.save();
  }

  /* ---------- queries ---------- */

  static findAll() {
    return CsvStore.rows(UserAccount.TABLE).map(r => new UserAccount(r));
  }

  static findById(id) {
    return UserAccount.findAll().find(a => a.getId() === String(id)) || null;
  }

  static findByEmail(email) {
    const e = String(email ?? '').trim().toLowerCase();
    return UserAccount.findAll().find(a => a.getEmail().toLowerCase() === e) || null;
  }

  // Returns 'username', 'email' or null. excludeId skips the account being edited.
  static findConflict(username, email, excludeId = null) {
    const u = String(username).trim().toLowerCase();
    const e = String(email).trim().toLowerCase();
    for (const a of UserAccount.findAll()) {
      if (excludeId !== null && a.getId() === String(excludeId)) continue;
      if (a.getUsername().toLowerCase() === u) return 'username';
      if (a.getEmail().toLowerCase() === e) return 'email';
    }
    return null;
  }

  // field: 'all' | 'username' | 'email' | 'role'. Case-insensitive "contains".
  static search(field, term) {
    const q = String(term).trim().toLowerCase();
    const pick = {
      username: a => [a.getUsername()],
      email: a => [a.getEmail()],
      role: a => [a.getRole()],
      all: a => [a.getUsername(), a.getEmail(), a.getRole()]
    }[field] || (a => [a.getUsername(), a.getEmail(), a.getRole()]);
    return UserAccount.findAll().filter(a => pick(a).some(v => v.toLowerCase().includes(q)));
  }
}
