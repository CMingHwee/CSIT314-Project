/*
 * Shared validation rules and the result object every controller returns.
 */
const Validation = {
  isBlank(value) {
    return String(value ?? '').trim() === '';
  },

  isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
  },

  // Singapore numbers: 8 digits starting with 6, 8 or 9. Spaces are allowed.
  isPhone(value) {
    return /^[689]\d{7}$/.test(String(value).replace(/\s+/g, ''));
  },

  // Formats "91230101" as "9123 0101".
  normalizePhone(value) {
    const digits = String(value ?? '').replace(/\s+/g, '');
    return digits ? `${digits.slice(0, 4)} ${digits.slice(4)}` : '';
  },

  // Company registration number (e.g. a Singapore UEN): letters and digits only.
  isRegistrationNumber(value) {
    return /^[A-Z0-9]{4,15}$/i.test(String(value ?? '').trim());
  },

  // A real calendar date in YYYY-MM-DD form (what <input type="date"> produces).
  isDate(value) {
    const s = String(value ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(s + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  },

  // Names: letters, spaces, hyphens, apostrophes and full stops only.
  isPersonName(value) {
    return /^[\p{L}][\p{L} .'\-]*$/u.test(String(value ?? '').trim());
  },

  // At least 8 characters, including a number and a symbol.
  isStrongPassword(value) {
    const s = String(value ?? '');
    return s.length >= 8 && /\d/.test(s) && /[^A-Za-z0-9]/.test(s);
  }
};

/*
 * Result — what a controller hands back to the boundary.
 *   success  true / false
 *   message  text for the page (success banner or error)
 *   fields   { fieldName: 'error text' } for inline errors under inputs
 *   data     anything else the page needs (the saved account, search results…)
 */
const Result = {
  ok(message, data = {}) {
    return { success: true, message, fields: {}, ...data };
  },
  fail(message, fields = {}, data = {}) {
    return { success: false, message, fields, ...data };
  },
  // Error that belongs to one input field.
  fieldError(field, message) {
    return { success: false, message, fields: { [field]: message } };
  },
  /*
   * "Validation failed." under one field, with the reason shown beneath it
   * (as in the Create Past IDP wireframe: "A past IDP's completion date can't be in the future.").
   */
  invalid(field, reason) {
    return {
      success: false,
      message: 'Validation failed.',
      fields: { [field]: 'Validation failed.' },
      reasons: { [field]: reason }
    };
  },
  // "Please fill in all required fields." with "Required." under each empty field.
  missing(fieldNames) {
    return {
      success: false,
      message: 'Please fill in all required fields.',
      fields: Object.fromEntries(fieldNames.map(f => [f, 'Required.']))
    };
  }
};
