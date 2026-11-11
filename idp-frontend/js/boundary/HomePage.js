/*
 * Boundary: HomePage — the public front page (index.html). Not a user story.
 * Shows completed IDPs, the top Interior Designers, platform numbers and a Log in button.
 * Clicking a project goes through the customer login and then straight to that project.
 */
class HomePage {
  static COMPLETED_SHOWN = 6;
  static DESIGNERS_SHOWN = 5;

  constructor() {
    this.controller = new ViewHomePageController();
    this.session = Session.check().status === 'active' ? Session.current() : null;
  }

  displayPage() {
    this.displayTopBar();
    this.displayStats();
    this.displayCategories();
    this.displayCompleted();
    this.displayDesigners();
    UI.el('clear-category').addEventListener('click', () => this.displayCompleted());
  }

  // "Log in", or — when someone is already signed in on this tab — a way back to their dashboard.
  displayTopBar() {
    if (!this.session) return;
    const dash = LOGIN_HOME[this.session.role] || 'login.html';
    UI.el('top-actions').innerHTML = `
      <span class="home-top-user">Signed in as <strong>${UI.escape(this.session.username)}</strong></span>
      <a class="btn btn-primary btn-small" href="${dash}">Go to my dashboard</a>`;
  }

  displayStats() {
    const s = this.controller.getPlatformStats();
    UI.el('stats').innerHTML =
      UI.statTile('Completed projects', s.completedProjects) +
      UI.statTile('Projects in progress', s.currentProjects) +
      UI.statTile('Interior designers', s.designers) +
      UI.statTile('Times shortlisted', s.timesShortlisted);
  }

  displayCategories() {
    const { rows } = this.controller.getCategories();
    const box = UI.el('category-links');
    box.innerHTML = rows.map(({ category: c, completed }) => `
      <a href="#completed" data-category="${UI.escape(c.getId())}">
        ${UI.escape(c.getName())}<span class="nav-count">${completed}</span>
      </a>`).join('');
    box.addEventListener('click', e => {
      const link = e.target.closest('[data-category]');
      if (link) this.displayCompleted(link.dataset.category);
    });
  }

  // Link for a project card: straight to it for a signed-in customer, otherwise via the customer login.
  projectLink(project) {
    const target = `project.html?id=${encodeURIComponent(project.getId())}&from=browse`;
    if (this.session && this.session.role === 'Customer') return target;
    return `login.html?role=Customer&next=${encodeURIComponent(target)}`;
  }

  displayCompleted(categoryId = '') {
    const r = this.controller.getCompletedProjects(categoryId ? 100 : HomePage.COMPLETED_SHOWN, categoryId);
    UI.el('completed-title').textContent = r.category
      ? `Completed ${r.category.getName()} projects · ${r.total}`
      : 'Recently completed projects';
    UI.el('clear-category').hidden = !categoryId;
    UI.el('category-links').querySelectorAll('a').forEach(a =>
      a.classList.toggle('active', a.dataset.category === String(categoryId)));

    UI.el('completed-grid').innerHTML = r.items.map(p => `
      <a class="project-card" href="${UI.escape(this.projectLink(p))}">
        ${UI.imageBox(p.getImages()[0], p.getProjectName(), '', p.getCategoryName() ? `<span class="tag">${UI.escape(p.getCategoryName())}</span>` : '')}
        <div class="pc-body">
          <strong>${UI.escape(p.getProjectName())}</strong>
          <span>${UI.escape(p.getDesignerName())}</span>
          <span class="pc-date">Completed ${UI.escape(UI.formatDate(p.getCompletionDate() || p.getStartDate()))}</span>
        </div>
      </a>`).join('');

    const empty = UI.el('completed-empty');
    empty.textContent = r.category ? `No completed ${r.category.getName()} projects yet.` : 'No completed projects yet.';
    empty.hidden = r.items.length > 0;
  }

  displayDesigners() {
    const r = this.controller.getTopDesigners(HomePage.DESIGNERS_SHOWN);
    UI.el('designer-list').innerHTML = r.rows.length
      ? r.rows.map(d => `
        <li class="rank-row">
          <span class="rank-no" aria-label="Rank ${d.rank}">${d.rank}</span>
          ${UI.photo(d.photo, d.designer)}
          <div class="rank-who">
            <strong>${UI.escape(d.company)}</strong>
            <span>${UI.escape(d.designer)}${d.location ? ' · ' + UI.escape(d.location) : ''}</span>
            <p>${UI.escape(d.description)}</p>
          </div>
          <dl class="rank-stats">
            <div><dt>Shortlisted</dt><dd>${UI.num(d.shortlisted)}</dd></div>
            <div><dt>Views</dt><dd>${UI.num(d.views)}</dd></div>
            <div><dt>Completed</dt><dd>${UI.num(d.completed)}</dd></div>
            <div><dt>In progress</dt><dd>${UI.num(d.current)}</dd></div>
          </dl>
        </li>`).join('')
      : `<li class="empty-state">No designers to show yet.</li>`;
  }
}

// Where each role's "Go to my dashboard" button leads.
const LOGIN_HOME = {
  'User Admin': 'admin-dashboard.html',
  'Interior Designer': 'designer-dashboard.html',
  'Customer': 'browse-projects.html',
  'Platform Management': 'pm-dashboard.html'
};

Layout.start(() => new HomePage().displayPage());
