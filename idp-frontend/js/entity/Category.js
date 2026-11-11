/*
 * Entity: Category (an IDP category such as Kitchen or Bedroom)
 * One row of data/categories.csv. Projects link to it through projects.csv → categoryId.
 */
class Category {
  static TABLE = 'categories';

  #id; #name; #description;

  constructor({ id = '', name = '', description = '' } = {}) {
    this.#id = String(id);
    this.#name = name;
    this.#description = description;
  }

  getId() { return this.#id; }
  getName() { return this.#name; }
  getDescription() { return this.#description; }

  setName(v) { this.#name = v; }
  setDescription(v) { this.#description = v; }

  // How many IDPs use this category (categories list and the delete check).
  countProjects() {
    return Project.findAll().filter(p => p.getCategoryId() === this.#id).length;
  }

  toRecord() {
    return { id: this.#id, name: this.#name, description: this.#description };
  }

  save() {
    const rows = CsvStore.rows(Category.TABLE);
    if (!this.#id) this.#id = CsvStore.nextId(Category.TABLE);
    const i = rows.findIndex(r => String(r.id) === this.#id);
    if (i >= 0) rows[i] = this.toRecord();
    else rows.push(this.toRecord());
    CsvStore.write(Category.TABLE, rows);
    return this;
  }

  delete() {
    const rows = CsvStore.rows(Category.TABLE).filter(r => String(r.id) !== this.#id);
    return CsvStore.write(Category.TABLE, rows);
  }

  static findAll() {
    return CsvStore.rows(Category.TABLE).map(r => new Category(r));
  }

  static findById(id) {
    return Category.findAll().find(c => c.getId() === String(id)) || null;
  }

  // Case-insensitive; excludeId skips the category being edited.
  static isNameTaken(name, excludeId = null) {
    const n = String(name).trim().toLowerCase();
    return Category.findAll().some(c =>
      (excludeId === null || c.getId() !== String(excludeId)) && c.getName().toLowerCase() === n);
  }

  // Case-insensitive "contains" on the category name.
  static searchByName(term) {
    const q = String(term).trim().toLowerCase();
    return Category.findAll().filter(c => c.getName().toLowerCase().includes(q));
  }
}
