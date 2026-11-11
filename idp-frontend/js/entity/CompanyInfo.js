/*
 * Entity: CompanyInfo
 * One row of data/companies.csv. Each Interior Designer account has at most one.
 */
class CompanyInfo {
  static TABLE = 'companies';

  // Fields a designer fills in, in display order. Used by search.
  static FIELDS = [
    { key: 'companyName', label: 'Company Name' },
    { key: 'registrationNumber', label: 'Registration Number' },
    { key: 'address', label: 'Address' },
    { key: 'contactEmail', label: 'Contact Email' },
    { key: 'description', label: 'Description' }
  ];

  #id; #accountId; #companyName; #registrationNumber; #address; #contactEmail; #description;

  constructor({ id = '', accountId = '', companyName = '', registrationNumber = '', address = '', contactEmail = '', description = '' } = {}) {
    this.#id = String(id);
    this.#accountId = String(accountId);
    this.#companyName = companyName;
    this.#registrationNumber = registrationNumber;
    this.#address = address;
    this.#contactEmail = contactEmail;
    this.#description = description;
  }

  getId() { return this.#id; }
  getAccountId() { return this.#accountId; }
  getCompanyName() { return this.#companyName; }
  getRegistrationNumber() { return this.#registrationNumber; }
  getAddress() { return this.#address; }
  getContactEmail() { return this.#contactEmail; }
  getDescription() { return this.#description; }

  setCompanyName(v) { this.#companyName = v; }
  setRegistrationNumber(v) { this.#registrationNumber = v; }
  setAddress(v) { this.#address = v; }
  setContactEmail(v) { this.#contactEmail = v; }
  setDescription(v) { this.#description = v; }

  // Value of one field by key, e.g. get('address').
  get(key) {
    return this.toRecord()[key] ?? '';
  }

  toRecord() {
    return {
      id: this.#id,
      accountId: this.#accountId,
      companyName: this.#companyName,
      registrationNumber: this.#registrationNumber,
      address: this.#address,
      contactEmail: this.#contactEmail,
      description: this.#description
    };
  }

  save() {
    const rows = CsvStore.rows(CompanyInfo.TABLE);
    if (!this.#id) this.#id = CsvStore.nextId(CompanyInfo.TABLE);
    const i = rows.findIndex(r => String(r.id) === this.#id);
    if (i >= 0) rows[i] = this.toRecord();
    else rows.push(this.toRecord());
    CsvStore.write(CompanyInfo.TABLE, rows);
    return this;
  }

  // Returns true if the row was removed and saved. On failure the data is left unchanged.
  delete() {
    const before = CsvStore.rows(CompanyInfo.TABLE);
    const after = before.filter(r => String(r.id) !== this.#id);
    if (after.length === before.length) return false;
    const ok = CsvStore.write(CompanyInfo.TABLE, after);
    if (!ok) CsvStore.write(CompanyInfo.TABLE, before);
    return ok;
  }

  // Keys of the fields whose value contains term (case-insensitive).
  matchingFields(term) {
    const q = String(term).trim().toLowerCase();
    return CompanyInfo.FIELDS.map(f => f.key).filter(k => this.get(k).toLowerCase().includes(q));
  }

  static findAll() {
    return CsvStore.rows(CompanyInfo.TABLE).map(r => new CompanyInfo(r));
  }

  static findByAccountId(accountId) {
    return CompanyInfo.findAll().find(c => c.getAccountId() === String(accountId)) || null;
  }

  // excludeId skips the designer's own company when updating.
  static isRegistrationNumberTaken(regNo, excludeId = null) {
    const r = String(regNo).trim().toUpperCase();
    return CompanyInfo.findAll().some(c =>
      (excludeId === null || c.getId() !== String(excludeId)) &&
      c.getRegistrationNumber().toUpperCase() === r);
  }
}
