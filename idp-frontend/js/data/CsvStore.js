/*
 * CsvStore — data access for the CSV files in /data.
 *
 * Browsers cannot write back to files on disk, so the store works like this:
 *   1. On first load it reads data/*.csv (fetch) and parses them.
 *   2. The working copy is kept in localStorage, still in CSV format,
 *      so changes survive page navigation and refreshes.
 *   3. download(table) exports the current data as a .csv file,
 *      and reset() throws the working copy away and re-reads the CSV files.
 */
const CsvStore = (() => {
  const TABLES = {
    user_accounts: {
      path: 'data/user_accounts.csv',
      columns: ['id', 'username', 'email', 'phone', 'password', 'role', 'status']
    },
    user_profiles: {
      path: 'data/user_profiles.csv',
      columns: ['id', 'accountId', 'firstName', 'lastName', 'address', 'companyName', 'companyRegNo', 'status', 'photo']
    },
    companies: {
      path: 'data/companies.csv',
      columns: ['id', 'accountId', 'companyName', 'registrationNumber', 'address', 'contactEmail', 'description']
    },
    projects: {
      path: 'data/projects.csv',
      columns: ['id', 'accountId', 'projectName', 'customerName', 'startDate', 'description', 'status', 'progress', 'categoryId',
        'specifications', 'progressNote', 'completionDate', 'images']
    },
    shortlists: {
      path: 'data/shortlists.csv',
      columns: ['id', 'accountId', 'projectId', 'savedAt']
    },
    categories: {
      path: 'data/categories.csv',
      columns: ['id', 'name', 'description']
    },
    project_views: {
      path: 'data/project_views.csv',
      columns: ['id', 'projectId', 'visitorId', 'viewedAt']
    },
    activity_log: {
      path: 'data/activity_log.csv',
      columns: ['id', 'timestamp', 'accountId', 'username', 'role', 'action', 'item']
    }
  };

  const storageKey = (table) => `idp.${table}.csv`;
  const cache = {};

  /* ---------- CSV text <-> records ---------- */

  // Parses CSV text (RFC 4180: quoted fields, "" escapes, commas/newlines inside quotes)
  // into an array of objects keyed by the header row.
  function parse(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    text = String(text).replace(/^﻿/, '');

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field); field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row);
        row = []; field = '';
      } else {
        field += c;
      }
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }

    const nonEmpty = rows.filter(r => !(r.length === 1 && r[0].trim() === ''));
    if (!nonEmpty.length) return [];
    const header = nonEmpty[0].map(h => h.trim());
    return nonEmpty.slice(1).map(r =>
      Object.fromEntries(header.map((h, i) => [h, r[i] ?? '']))
    );
  }

  function escapeCell(value) {
    const s = String(value ?? '');
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function serialize(table, records) {
    const cols = TABLES[table].columns;
    const lines = records.map(r => cols.map(c => escapeCell(r[c])).join(','));
    return [cols.join(','), ...lines].join('\n') + '\n';
  }

  /* ---------- localStorage (wrapped: it can be blocked in some browsers) ---------- */

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  }
  function storageRemove(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }

  /* ---------- public API ---------- */

  // Loads the given tables (default: all). Throws an Error with .missing = [table names]
  // if a CSV could not be read (usually because the page was opened as file://).
  async function init(tables = Object.keys(TABLES)) {
    const missing = [];
    for (const table of tables) {
      if (!TABLES[table]) throw new Error(`Unknown table: ${table}`);
      if (cache[table]) continue;
      let text = storageGet(storageKey(table));
      if (text === null) {
        try {
          const res = await fetch(TABLES[table].path, { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          text = await res.text();
          storageSet(storageKey(table), text);
        } catch {
          missing.push(table);
          continue;
        }
      }
      cache[table] = parse(text);
    }
    if (missing.length) {
      const err = new Error('Could not load CSV data: ' + missing.join(', '));
      err.missing = missing;
      throw err;
    }
  }

  // Used when the CSV cannot be fetched: the user picks the file manually.
  function importText(table, text) {
    const records = parse(text);
    const header = Object.keys(records[0] || {});
    const absent = TABLES[table].columns.filter(c => !header.includes(c));
    if (records.length && absent.length) {
      throw new Error(`${TABLES[table].path} is missing column(s): ${absent.join(', ')}`);
    }
    cache[table] = records;
    storageSet(storageKey(table), serialize(table, records));
  }

  function rows(table) {
    return (cache[table] || []).map(r => ({ ...r }));
  }

  function isLoaded(table) {
    return Array.isArray(cache[table]);
  }

  // Returns false if the browser refused to save (storage full or blocked).
  // Writing a table the page did not load would overwrite it with partial data, so that is an error.
  function write(table, records) {
    if (!isLoaded(table)) {
      throw new Error(`CsvStore: "${table}" was not loaded on this page — add it to <body data-tables>.`);
    }
    cache[table] = records.map(r => ({ ...r }));
    return storageSet(storageKey(table), serialize(table, cache[table]));
  }

  function nextId(table) {
    const max = (cache[table] || []).reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
    return String(max + 1);
  }

  function count(table) {
    return (cache[table] || []).length;
  }

  function download(table) {
    const blob = new Blob([serialize(table, cache[table] || [])], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = TABLES[table].path.split('/').pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function reset() {
    for (const table of Object.keys(TABLES)) {
      storageRemove(storageKey(table));
      delete cache[table];
    }
  }

  return { TABLES, init, importText, isLoaded, rows, write, nextId, count, download, reset, parse, serialize };
})();
