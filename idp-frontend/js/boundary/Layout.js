/*
 * Layout — draws the sidebar for the page's area, checks the session,
 * loads the CSV data, then starts the page.
 *
 * Each page's <body> says which area it belongs to:
 *   data-area="public"    login pages and the demo-data page: no sidebar, no session needed
 *   data-area="admin"     User Admin pages. Requires a User Admin session from the Admin Portal.
 *   data-area="designer"  Interior Designer pages. Requires an Interior Designer session.
 *   data-area="customer"  Customer pages. Requires a Customer session. Top nav, no sidebar.
 *   data-area="manager"   Platform Management pages. Requires a Platform Management session.
 * and data-nav="<key>" marks the active sidebar link,
 * and data-tables="user_accounts,companies" lists the CSV tables the page needs (default: all).
 *
 * Usage: Layout.start(session => new SomePage(session).displayPage());
 */
const Layout = (() => {
  const AREAS = {
    admin: {
      brand: 'Admin',
      requiredRole: 'User Admin',
      loginPage: 'admin-login.html',   // Admin Portal
      nav: [
        { key: 'dashboard', label: 'Dashboard', href: 'admin-dashboard.html' },
        { key: 'user-accounts', label: 'User Accounts', href: 'user-accounts.html' },
        { key: 'create-account', label: 'Create Account', href: 'create-account.html' },
        { key: 'search-accounts', label: 'Search Accounts', href: 'search-accounts.html' },
        { key: 'user-profiles', label: 'User Profiles', href: 'user-profiles.html' }
      ]
    },
    designer: {
      brand: 'Designer',
      requiredRole: 'Interior Designer',
      nav: [
        { key: 'dashboard', label: 'Dashboard', href: 'designer-dashboard.html' },
        { key: 'company-profile', label: 'Company Profile', href: 'company-profile.html' },
        { key: 'my-projects', label: 'My Projects', href: 'my-projects.html' }
      ]
    },
    manager: {
      brand: 'Management',
      requiredRole: 'Platform Management',
      nav: [
        { key: 'dashboard', label: 'Dashboard', href: 'pm-dashboard.html' },
        { key: 'categories', label: 'Category Management', href: 'categories.html' },
        { key: 'reports', label: 'Reports', href: 'reports.html' }
      ]
    },
    // Customers get a top navigation bar instead of a sidebar.
    customer: {
      brand: 'Customer',
      requiredRole: 'Customer',
      topnav: true,
      nav: [
        { key: 'browse', label: 'Browse Projects', href: 'browse-projects.html' },
        { key: 'profile', label: 'My Profile', href: 'my-profile.html' }
      ]
    }
  };

  const AVATAR = { 'User Admin': 'UA', 'Interior Designer': 'ID', 'Customer': 'C', 'Platform Management': 'PM' };

  function areaName() {
    return document.body.dataset.area || 'admin';
  }

  function renderSidebar(area) {
    const active = document.body.dataset.nav;
    const links = area.nav.map(n =>
      `<a href="${n.href}"${n.key === active ? ' class="active" aria-current="page"' : ''}>${n.label}</a>`
    ).join('');

    const logout = `<a href="#" id="logout-link">Log out</a>`;

    UI.el('sidebar').innerHTML = `
      <div class="brand">
        <div class="logo" aria-hidden="true">LOGO</div>
        <div class="brand-name">IDP Platform ·<br>${area.brand}</div>
      </div>
      <nav class="nav nav-main" aria-label="${area.brand}">${links}</nav>
      <nav class="nav">${logout}</nav>`;
  }

  // Top bar: logo, nav links, then the signed-in user and Log out on the right.
  function renderTopnav(area, session) {
    const active = document.body.dataset.nav;
    const links = area.nav.map(n =>
      `<a href="${n.href}"${n.key === active ? ' class="active" aria-current="page"' : ''}>${n.label}</a>`
    ).join('');

    UI.el('topnav').innerHTML = `
      <div class="topnav-inner">
        <a class="brand" href="${area.nav[0].href}">
          <span class="logo" aria-hidden="true">LOGO</span>
          <span class="brand-name">IDP Platform</span>
        </a>
        <nav class="topnav-links" aria-label="${area.brand}">${links}</nav>
        <div class="topnav-user">
          <span class="avatar">${UI.escape(session.username.charAt(0).toUpperCase())}</span>
          <span class="topnav-username">${UI.escape(session.username)}</span>
          <a href="#" id="logout-link">Log out</a>
        </div>
      </div>`;
  }

  let currentArea = null;

  function sendToLogin(type, message) {
    UI.setFlash(type, message);
    location.replace((currentArea && currentArea.loginPage) || 'login.html');
  }

  // Returns the active session, or null after redirecting to the login page.
  function checkSession(area) {
    if (!area.requiredRole) return null;
    const result = Session.check();
    if (result.status === 'expired') { sendToLogin('error', 'Session expired. Please log in again.'); return null; }
    if (result.status === 'none') { sendToLogin('error', 'Please log in to continue.'); return null; }
    if (result.session.role !== area.requiredRole) {
      const article = /^[AEIOU]/i.test(area.requiredRole) ? 'an' : 'a';
      sendToLogin('error', `Please log in as ${article} ${area.requiredRole} to open that page.`);
      return null;
    }
    return result.session;
  }

  // After the data loads: the account may have been suspended or removed since login.
  function accountStillValid(session) {
    const account = UserAccount.findById(session.accountId);
    if (!account) { Session.end(); sendToLogin('error', 'Please log in to continue.'); return false; }
    if (!account.isActive()) { Session.end(); sendToLogin('error', 'Your account has been suspended.'); return false; }
    return true;
  }

  function renderUserChip(session) {
    const chip = UI.el('user-chip');
    if (!chip || !session) return;
    chip.innerHTML = `<span class="avatar">${AVATAR[session.role] || '?'}</span>` +
      `Signed in as ${UI.escape(session.username)} · ${UI.escape(session.role)}`;
  }

  function showFlash() {
    const flash = UI.takeFlash();
    if (flash) UI.showBanner(flash.type, UI.escape(flash.message));
  }

  // Shown when the CSV files cannot be fetched (e.g. the page was opened by double-click as file://).
  function renderLoadError(missing) {
    UI.el('page-content').hidden = true;
    const pickers = missing.map(t => `
      <div class="field">
        <label for="pick-${t}">${CsvStore.TABLES[t].path}</label>
        <input type="file" id="pick-${t}" accept=".csv,text/csv" data-table="${t}">
      </div>`).join('');

    UI.el('page-banner').innerHTML = `
      <div class="card narrow">
        <p class="section-label">Data not loaded</p>
        <p>The browser could not read the CSV files. This happens when the page is opened
           straight from disk (<code>file://</code>), because browsers block reading local files.</p>
        <p><strong>Easiest fix:</strong> run a local server in the project folder, e.g.
           <code>python -m http.server 8000</code>, then open <code>http://localhost:8000</code>
           (or use VS Code's Live Server).</p>
        <p>Or load the file(s) from the <code>data</code> folder manually:</p>
        <div class="file-picker">${pickers}</div>
        <p class="field-error" id="pick-error"></p>
      </div>`;

    const remaining = new Set(missing);
    UI.el('page-banner').querySelectorAll('input[type="file"]').forEach(input => {
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        try {
          CsvStore.importText(input.dataset.table, await file.text());
          remaining.delete(input.dataset.table);
          input.disabled = true;
          if (!remaining.size) location.reload();
        } catch (err) {
          UI.el('pick-error').textContent = err.message;
        }
      });
    });
  }

  async function start(onReady) {
    const name = areaName();
    const area = AREAS[name] || null;
    currentArea = area;

    let session = null;
    if (area) {
      if (!area.topnav) renderSidebar(area);
      if (area.requiredRole) {
        session = checkSession(area);
        if (!session) return;
      }
      if (area.topnav) renderTopnav(area, session);
    }

    // <body data-tables="user_accounts,companies"> limits loading to what the page uses.
    const tables = (document.body.dataset.tables || '').split(',').map(s => s.trim()).filter(Boolean);

    try {
      await CsvStore.init(tables.length ? tables : undefined);
    } catch (err) {
      if (err.missing) { renderLoadError(err.missing); return; }
      throw err;
    }

    if (session && !accountStillValid(session)) return;

    renderUserChip(session);
    // User Admins log out in one click; every other role confirms first.
    if (session && name === 'admin' && typeof UserAdminLogoutPage !== 'undefined') new UserAdminLogoutPage().displayPage();
    else if (session && typeof LogoutPage !== 'undefined') new LogoutPage().displayPage();
    showFlash();
    onReady(session);
  }

  return { start };
})();
