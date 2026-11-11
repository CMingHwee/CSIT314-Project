/*
 * Small helpers shared by every page (boundary layer only).
 */
const UI = {
  el(id) {
    return document.getElementById(id);
  },

  param(name) {
    return new URLSearchParams(location.search).get(name);
  },

  escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  },

  // Escapes text and wraps every case-insensitive match of term in <mark>.
  highlight(text, term) {
    const s = String(text ?? '');
    const q = String(term ?? '').trim();
    if (!q) return UI.escape(s);
    const lower = s.toLowerCase();
    const needle = q.toLowerCase();
    let out = '';
    let i = 0;
    let at;
    while ((at = lower.indexOf(needle, i)) !== -1) {
      out += UI.escape(s.slice(i, at)) + '<mark>' + UI.escape(s.slice(at, at + q.length)) + '</mark>';
      i = at + q.length;
    }
    return out + UI.escape(s.slice(i));
  },

  statusPill(status) {
    const inactive = status !== UserAccount.ACTIVE;
    return `<span class="pill${inactive ? ' inactive' : ''}">${UI.escape(status)}</span>`;
  },

  roleOptions(roles, selected = '') {
    const first = `<option value="">Select a role…</option>`;
    return first + roles.map(r =>
      `<option value="${UI.escape(r)}"${r === selected ? ' selected' : ''}>${UI.escape(r)}</option>`
    ).join('');
  },

  /* ---------- banners ---------- */

  // type: 'success' | 'error' | 'info'. html is trusted markup built by the page.
  showBanner(type, html) {
    const box = UI.el('page-banner');
    box.innerHTML = `<div class="banner banner-${type}" role="${type === 'error' ? 'alert' : 'status'}">${html}</div>`;
    box.scrollIntoView({ block: 'nearest' });
  },

  clearBanner() {
    const box = UI.el('page-banner');
    if (box) box.innerHTML = '';
  },

  /* ---------- inline field errors ---------- */

  clearFieldErrors(form) {
    form.querySelectorAll('.field.has-error').forEach(f => f.classList.remove('has-error'));
    form.querySelectorAll('.field-error').forEach(e => { e.textContent = ''; });
    form.querySelectorAll('.field-reason').forEach(e => e.remove());
    form.querySelectorAll('[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
  },

  // fields: { name: message }. Each field wrapper has data-field="name".
  // reasons (optional): { name: 'why' } shown under the message, e.g. for "Validation failed."
  showFieldErrors(form, fields, reasons = {}) {
    let first = null;
    for (const [name, message] of Object.entries(fields || {})) {
      const wrap = form.querySelector(`[data-field="${name}"]`);
      if (!wrap) continue;
      wrap.classList.add('has-error');
      const msg = wrap.querySelector('.field-error');
      if (msg) msg.textContent = message;
      if (msg && reasons && reasons[name]) {
        msg.insertAdjacentHTML('afterend', `<span class="field-reason">${UI.escape(reasons[name])}</span>`);
      }
      const input = wrap.querySelector('input, select, textarea');
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        if (!first) first = input;
      }
    }
    if (first) first.focus();
  },

  /* ---------- one-time message carried to the next page ---------- */

  // e.g. after deleting company info, the dashboard shows "Company Information Deleted Successfully".
  setFlash(type, message) {
    try { sessionStorage.setItem('idp.flash', JSON.stringify({ type, message })); } catch { /* ignore */ }
  },

  takeFlash() {
    try {
      const raw = sessionStorage.getItem('idp.flash');
      sessionStorage.removeItem('idp.flash');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // 2026-11-15 → "15 Nov 2026"
  formatDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''));
    if (!m) return String(iso ?? '');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}`;
  },

  /* ---------- pictures ---------- */

  /*
   * A picture box: shows the image when there is one, otherwise the grey "X" placeholder.
   * If the file is missing (typo, not copied yet) it falls back to the placeholder too.
   * cls: extra classes, e.g. "hero"; inner: extra markup such as a "Just added" tag.
   */
  imageBox(src, alt, cls = '', inner = '') {
    const c = `ph${cls ? ' ' + cls : ''}`;
    if (!src) return `<div class="${c}" role="img" aria-label="${UI.escape(alt)} (no picture yet)">${inner}</div>`;
    return `<div class="${c} has-img">${inner}<img src="${UI.escape(src)}" alt="${UI.escape(alt)}" loading="lazy" onerror="UI.imageFailed(this)"></div>`;
  },

  // Round photo for a person; initials when there is no photo.
  photo(src, name, cls = 'photo') {
    const initials = String(name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const img = src ? `<img src="${UI.escape(src)}" alt="${UI.escape(name)}" onerror="UI.imageFailed(this)">` : '';
    return `<div class="${cls}${src ? ' has-img' : ''}" aria-hidden="${src ? 'false' : 'true'}"><span>${UI.escape(initials)}</span>${img}</div>`;
  },

  imageFailed(img) {
    const box = img.parentNode;
    if (box) box.classList.remove('has-img');
    img.remove();
  },

  /*
   * A project card (image placeholder, name, designer) for customer pages.
   * item: { project, projectId, designer, available } from Project.toCard() / Shortlist.toCard()
   * opts: { href, term (to highlight), tag (small label on the image) }
   */
  projectCard(item, { href = '#', term = '', tag = '' } = {}) {
    const name = item.project ? item.project.getProjectName() : 'Removed project';
    const designer = item.available ? item.designer : 'No longer available';
    return `
      <a class="project-card${item.available ? '' : ' unavailable'}" href="${UI.escape(href)}">
        ${UI.imageBox(item.project ? item.project.getImages()[0] : '', name, '', tag ? `<span class="tag">${UI.escape(tag)}</span>` : '')}
        <div class="pc-body">
          <strong>${UI.highlight(name, term)}</strong>
          <span>${UI.highlight(designer, item.available ? term : '')}</span>
        </div>
      </a>`;
  },

  // Thin progress bar with the percentage in front, as in the View / Search Current IDP wireframes.
  progressBar(pct, note = '') {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    return `
      <div class="hbar" title="${p}% complete${note ? ' · ' + UI.escape(note) : ''}">
        <b>${p}%</b>
        <span class="track"><span class="fill" style="width:${p}%"></span></span>
      </div>`;
  },

  /* ---------- charts & reports ---------- */

  // 1234 → "1,234"
  num(n) {
    return Number(n || 0).toLocaleString('en-SG');
  },

  // Rounds an axis maximum up to 1, 2, 2.5 or 5 × 10^k.
  niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  },

  /*
   * Single-series column chart, plain HTML/CSS.
   * items: [{ label, value, tip? }]   opts: { unit, labelEvery, caption, partialNote }
   * Each x-label lives inside its own column, so labels always line up with their bars.
   * The peak is labelled; every column has a hover/focus tooltip; a table view sits underneath.
   */
  columnChart(items, { unit = 'views', labelEvery = 1, caption = '' } = {}) {
    const max = UI.niceMax(Math.max(...items.map(i => i.value), 0));
    const peak = Math.max(...items.map(i => i.value));
    const peakIdx = items.findIndex(i => i.value === peak && peak > 0);

    const cols = items.map((it, i) => {
      const h = (it.value / max) * 100;
      const tip = it.tip || `${it.label}: ${UI.num(it.value)} ${unit}`;
      return `
        <div class="cc-col" tabindex="0" data-tip="${UI.escape(tip)}" aria-label="${UI.escape(tip)}">
          <div class="cc-area">
            ${i === peakIdx ? `<span class="cc-val">${UI.num(it.value)}</span>` : ''}
            <span class="cc-bar" style="height:${h}%"></span>
          </div>
          <span class="cc-x${i % labelEvery === 0 ? '' : ' cc-x-hide'}">${UI.escape(it.label)}</span>
        </div>`;
    }).join('');

    const ticks = [max, max / 2, 0].map((t, i) =>
      `<span class="cc-tick" style="bottom:${100 - i * 50}%">${UI.num(t)}</span>`).join('');

    const rows = items.map(it => `<tr><td>${UI.escape(it.label)}</td><td>${UI.num(it.value)}</td></tr>`).join('');

    return `
      <figure class="col-chart">
        ${caption ? `<figcaption class="section-label">${UI.escape(caption)}</figcaption>` : ''}
        <div class="cc-plot" style="--cols:${items.length}">
          <div class="cc-grid" aria-hidden="true">${ticks}<i style="bottom:100%"></i><i style="bottom:50%"></i><i style="bottom:0"></i></div>
          <div class="cc-cols">${cols}</div>
        </div>
        <details class="cc-table no-print">
          <summary>Show as table</summary>
          <table><thead><tr><th>${UI.escape(caption || 'Period')}</th><th>${UI.escape(unit[0].toUpperCase() + unit.slice(1))}</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </details>
      </figure>`;
  },

  // Stat tile: label, value, optional note (e.g. "+8% vs last week").
  statTile(label, value, note = '') {
    return `
      <div class="stat">
        <span class="stat-label">${UI.escape(label)}</span>
        <span class="stat-value">${typeof value === 'number' ? UI.num(value) : UI.escape(value)}</span>
        ${note ? `<span class="stat-note">${UI.escape(note)}</span>` : ''}
      </div>`;
  },

  // "+8% vs last week", "−3% vs last week", or "" when there is nothing to compare with.
  changeNote(pct, period) {
    if (pct === null || pct === undefined) return `No data for the ${period} before`;
    const sign = pct > 0 ? '+' : pct < 0 ? '−' : '±';
    return `${sign}${Math.abs(pct)}% vs ${period} before`;
  },

  // rows: array of arrays → downloads a .csv file.
  downloadCsv(filename, rows) {
    const cell = v => {
      const s = String(v ?? '');
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const text = rows.map(r => r.map(cell).join(',')).join('\n') + '\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },

  // Reads a form into a plain object keyed by input name.
  formValues(form) {
    return Object.fromEntries(new FormData(form).entries());
  }
};
