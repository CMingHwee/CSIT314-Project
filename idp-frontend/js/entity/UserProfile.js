/*
 * Entity: UserProfile
 * One row of data/user_profiles.csv, linked to a UserAccount through accountId.
 * A profile can be suspended independently of the account:
 * a suspended profile is hidden from public search, but the user can still log in.
 */
class UserProfile {
  static TABLE = 'user_profiles';
  static ACTIVE = 'Active';
  static SUSPENDED = 'Suspended';

  #id; #accountId; #firstName; #lastName; #address; #companyName; #companyRegNo; #status; #photo;

  constructor({ id = '', accountId = '', firstName = '', lastName = '', address = '', companyName = '', companyRegNo = '', status = UserProfile.ACTIVE, photo = '' } = {}) {
    this.#id = String(id);
    this.#accountId = String(accountId);
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#address = address;
    this.#companyName = companyName;
    this.#companyRegNo = companyRegNo;
    this.#status = status || UserProfile.ACTIVE;
    this.#photo = photo;   // file name in images/profiles/
  }

  getId() { return this.#id; }
  getAccountId() { return this.#accountId; }
  getFirstName() { return this.#firstName; }
  getLastName() { return this.#lastName; }
  getFullName() { return `${this.#firstName} ${this.#lastName}`.trim(); }
  getAddress() { return this.#address; }
  getCompanyName() { return this.#companyName; }
  getCompanyRegNo() { return this.#companyRegNo; }
  getStatus() { return this.#status; }
  isSuspended() { return this.#status === UserProfile.SUSPENDED; }

  // Photo path, e.g. "images/profiles/bchen.jpg", or '' when there is none.
  getPhoto() {
    const f = String(this.#photo || '').trim();
    if (!f) return '';
    return /^(https?:|data:|images\/)/.test(f) ? f : `images/profiles/${f}`;
  }

  /*
   * Location = the town or area in the address, i.e. the part just before "Singapore":
   * "21 Example Street 3, #08-12, Tampines, Singapore 000000" → "Tampines".
   * Returns '' when the address has no such part.
   */
  getLocation() {
    const parts = String(this.#address).split(',').map(s => s.trim()).filter(Boolean);
    const sg = parts.findIndex(p => /^singapore\b/i.test(p));
    if (sg > 0 && !/^#|\d/.test(parts[sg - 1])) return parts[sg - 1];
    return '';
  }

  // The owning account (null if it no longer exists).
  getAccount() {
    return UserAccount.findById(this.#accountId);
  }

  setFirstName(v) { this.#firstName = v; }
  setLastName(v) { this.#lastName = v; }
  setAddress(v) { this.#address = v; }
  setCompanyName(v) { this.#companyName = v; }
  setCompanyRegNo(v) { this.#companyRegNo = v; }

  toRecord() {
    return {
      id: this.#id,
      accountId: this.#accountId,
      firstName: this.#firstName,
      lastName: this.#lastName,
      address: this.#address,
      companyName: this.#companyName,
      companyRegNo: this.#companyRegNo,
      status: this.#status,
      photo: this.#photo
    };
  }

  save() {
    const rows = CsvStore.rows(UserProfile.TABLE);
    if (!this.#id) this.#id = CsvStore.nextId(UserProfile.TABLE);
    const i = rows.findIndex(r => String(r.id) === this.#id);
    if (i >= 0) rows[i] = this.toRecord();
    else rows.push(this.toRecord());
    CsvStore.write(UserProfile.TABLE, rows);
    return this;
  }

  // Status → Suspended. The profile data is kept.
  suspend() {
    this.#status = UserProfile.SUSPENDED;
    return this.save();
  }

  static findAll() {
    return CsvStore.rows(UserProfile.TABLE).map(r => new UserProfile(r));
  }

  static findById(id) {
    return UserProfile.findAll().find(p => p.getId() === String(id)) || null;
  }

  static findByAccountId(accountId) {
    return UserProfile.findAll().find(p => p.getAccountId() === String(accountId)) || null;
  }

  // by: 'company' | 'location'. Case-insensitive "contains"; location searches the whole address.
  static search(by, term) {
    const q = String(term).trim().toLowerCase();
    return UserProfile.findAll().filter(p =>
      (by === 'company' ? p.getCompanyName() : p.getAddress()).toLowerCase().includes(q));
  }
}
