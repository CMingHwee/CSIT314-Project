/*
 * Date helpers for analytics and reports. Days are counted in the browser's local time
 * (Singapore for this project); timestamps in the CSV files are stored in UTC.
 */
const DateUtil = {
  DAY_NAMES: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  MONTH_NAMES: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  pad(n) {
    return String(n).padStart(2, '0');
  },

  // Date → "YYYY-MM-DD" in local time.
  toKey(date) {
    return `${date.getFullYear()}-${DateUtil.pad(date.getMonth() + 1)}-${DateUtil.pad(date.getDate())}`;
  },

  todayKey() {
    return DateUtil.toKey(new Date());
  },

  // "YYYY-MM-DD" → Date at local midnight (null if invalid).
  fromKey(key) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key ?? ''));
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return DateUtil.toKey(d) === key ? d : null;
  },

  addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  },

  // "2026-11-02" → "2 Nov 2026"
  label(dateOrKey) {
    const d = typeof dateOrKey === 'string' ? DateUtil.fromKey(dateOrKey) : dateOrKey;
    if (!d) return String(dateOrKey);
    return `${d.getDate()} ${DateUtil.MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  },

  // "2026-11" → { start: 1 Nov 00:00, end: 1 Dec 00:00 } (local), null if invalid.
  monthRange(monthKey) {
    const m = /^(\d{4})-(\d{2})$/.exec(String(monthKey ?? ''));
    if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return null;
    const start = new Date(Number(m[1]), Number(m[2]) - 1, 1);
    const end = new Date(Number(m[1]), Number(m[2]), 1);
    return { start, end };
  },

  // ISO timestamp → is it within [start, end)?
  within(iso, start, end) {
    const t = new Date(iso).getTime();
    return t >= start.getTime() && t < end.getTime();
  }
};
