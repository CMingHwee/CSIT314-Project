/*
 * Validation rules shared by the IDP controllers.
 * Each check returns a Result.invalid(...) for "Validation failed." or null when the value is fine.
 */
const IDPRules = {
  NAME_MAX: 100,
  DESCRIPTION_MAX: 1000,
  SPECS_MAX: 20,

  checkName(accountId, name, excludeId = null) {
    if (name.length > IDPRules.NAME_MAX) {
      return Result.invalid('name', `Keep the name to ${IDPRules.NAME_MAX} characters or fewer.`);
    }
    if (Project.isNameTakenBy(accountId, name, excludeId)) {
      return Result.invalid('name', 'You already have another IDP with this name.');
    }
    return null;
  },

  checkDescription(description) {
    if (description.length > IDPRules.DESCRIPTION_MAX) {
      return Result.invalid('description', `Keep the description to ${IDPRules.DESCRIPTION_MAX} characters or fewer.`);
    }
    return null;
  },

  // Specifications are entered one per line.
  checkSpecifications(lines) {
    if (lines.length > IDPRules.SPECS_MAX) {
      return Result.invalid('specifications', `List up to ${IDPRules.SPECS_MAX} specifications, one per line.`);
    }
    return null;
  },

  // A past IDP's completion date must be a real date, today or earlier.
  checkCompletionDate(dateKey) {
    if (!Validation.isDate(dateKey)) {
      return Result.invalid('completionDate', 'Please enter a valid date.');
    }
    if (dateKey > DateUtil.todayKey()) {
      return Result.invalid('completionDate', "A past IDP's completion date can't be in the future.");
    }
    return null;
  },

  // "a\n\n  b " → ["a", "b"]
  toLines(text) {
    return String(text ?? '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }
};
