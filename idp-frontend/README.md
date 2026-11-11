# IDP Platform — front end (all 48 user stories)

Plain HTML, CSS and JavaScript. Data lives in CSV files. No build step and no libraries.

Covers **every user story**, built from the use case descriptions and wireframes.

## How to run

Browsers block JavaScript from reading local files, so open it through a small local server:

```bash
cd idp-frontend
python -m http.server 8000
```

Then open <http://localhost:8000>, which is the **homepage**. Its **Log in** button (top right) opens
`login.html` for designers, customers and Platform Management. **User Admins** sign in at
<http://localhost:8000/admin-login.html>
(the Admin Portal) with their **username**. VS Code's **Live Server** extension works too.

If you double-click an HTML file instead (`file://`), the page explains the problem and lets
you pick the CSV file(s) it needs by hand.

> **Already ran an earlier version?** The browser keeps its own copy of the data. Open
> **Manage demo CSV data** (linked from both login pages, `demo-data.html`) → **Reload from CSV
> files** once, so the new data loads. No login is needed for that page.

## The homepage

- **Completed projects** are the past IDPs customers can see, newest first (6 shown; a category in the
  left bar shows all of that category).
- **Top interior designers** are ranked by how many times customers shortlisted their projects, then
  by views — the page says so. Only designers customers can see are ranked, so a designer whose company
  info is deleted, account suspended or profile suspended drops off.
- Signed in already? The Log in button becomes **Go to my dashboard**.
- Logic: `ViewHomePageController` (data) → `HomePage` (boundary), same BCE pattern as the stories.

## Adding pictures

Every picture slot shows a grey "X" placeholder until you add a real image.

| What | Put the file in | Then name it in |
|---|---|---|
| Project pictures (IDPs) | `images/projects/` | `data/projects.csv` → `images` column. One or more file names separated by `|`; the first is the cover. |
| People's photos | `images/profiles/` | `data/user_profiles.csv` → `photo` column. One file name. |

Example: copy `scandi-1.jpg` and `scandi-2.jpg` into `images/projects/`, then set project 1's
`images` cell to `scandi-1.jpg|scandi-2.jpg`. Open `demo-data.html` → **Reload from CSV files**.

Project pictures appear on the customer cards, the customer project page (1 large + 3 small) and
the designer's Current/Past IDP pages. Photos appear on View User Profile (admin), the customer's
My Profile header, and next to the designer's name on the customer project page. A missing or
misspelt file falls back to the placeholder. See `images/README.txt` for details.

## Colours

The palette is the wireframes' greyscale turned into a blue ramp: white stays white, greys became
light blues, and the darkest greys became navy. Each colour kept its lightness, so text contrast is
unchanged (all text passes WCAG AA). The User Admin area stays a shade darker than the others, as
in the wireframes. Error reds are unchanged.

## Test accounts

| Email | Password | Role | Notes |
|---|---|---|---|
| alee@example.com | `Admin#2026` | User Admin | Admin Portal: username **`alee`** |
| bchen@example.com | `Design#2026` | Interior Designer | Studio Example Pte Ltd — 2 projects |
| otan@example.com | `Design#2028` | Interior Designer | Oakline Design — 2 projects |
| njames@example.com | `Design#2029` | Interior Designer | Northlight Interiors — 2 projects |
| dkumar@example.com | `Design#2027` | Interior Designer | No company yet — for Create Company Info, and "No projects available to analyze" |
| cdavis@example.com | `Shop#2026x` | Customer | 3 projects in her shortlist |
| ftan@example.com | `Shop#2027x` | Customer | Empty shortlist |
| gwong@example.com | `Manage#2027` | Platform Management | |
| erahman@example.com | `Manage#2026` | Platform Management | **Inactive** — "Your account has been suspended." |
| jong@example.com | `Design#2030` | Interior Designer | Account Active, **profile Suspended** (Suspend User Profile: "already suspended") |

bchen (Studio Example) has **4 current IDPs** and **3 past IDPs**, matching the IDP wireframes
("2 of 4 current IDPs match 'kitchen'", "1 of 3 past IDPs matches 'kitchen'").

## Pages by actor

### User Admin — sidebar, darker palette

| Page | Story | Alternate flows handled |
|---|---|---|
| `create-account.html` | Create User Account | Required fields; user already exists; weak password; invalid email/phone |
| `user-accounts.html` | View User Account | No users found |
| `update-account.html?id=…` | Update User Account | Username/email already in use; Password too weak; passwords do not match |
| `suspend-account.html?id=…` | Suspend User Account | Cancel; Account is already suspended |
| `search-accounts.html` | Search User Accounts | Please enter a search term; No users found |
| `create-profile.html` | Create User Profile | Required fields; Profile already exists |
| `user-profiles.html` | View User Profile | **Profile not found for this user.** (e.g. User Accounts → View Profile for dkumar) |
| `edit-profile.html?id=…` | Edit User Profile | **Please fill in all required fields.**; Cancel; **Validation failed.** (+ reason) |
| `suspend-profile.html?id=…` | Suspend User Profile | Cancel; **Profile is already suspended.** |
| `search-profiles.html` | Search User Profiles | **Please enter a company name or location.**; **No matching profiles found.** |
| `admin-login.html` | User Admin Log In | **Please enter your username and password.**; **Invalid username or password.** |
| Sidebar **Log out** | User Admin Log Out | One click, no confirmation; **Logout failed. Please try again.**; Session expired |
| `admin-dashboard.html` | — | Quick links |

All User Admin pages now need a User Admin session; without one they send you to the Admin Portal.

**Profile vs account.** Suspending a *profile* hides it from public search but the user can
still log in; suspending an *account* blocks the login. In this app a suspended designer
profile also removes that designer's projects from customer search. "Location" is the town in the
address (the part just before "Singapore"), so no extra field was needed in Create User Profile.

### Interior Designer — sidebar, lighter palette

| Page | Story | Alternate flows handled |
|---|---|---|
| `login.html` | Login | Invalid credentials; account suspended |
| Sidebar **Log out** | Logout | Cancel; Session expired (30 idle minutes) |
| `create-company.html` | Create Company Info | Required fields; registration number already exists |
| `company-profile.html` | View Company Info | No company information found |
| `company-profile.html` (search bar) | Search Company Info | Please enter a search term; No matching details found |
| `company-profile.html` (Delete) | Delete Company Info | Cancel; Failed to delete company information |
| `update-company.html` | Update Company Info | Required fields; duplicate registration number |
| `create-project.html` | Create Current IDP | Needs company info first; required fields. Optional category picker |
| `my-projects.html` | Search Current IDP (and the Current IDPs list) | **Please enter a search query.**; **No matching IDP found.** |
| `current-idp.html?id=…` | View Current IDP | **IDP not found.** (also for another designer's IDP) |
| `update-current-idp.html?id=…` | Update Current IDP | Required fields; Cancel; **Validation failed.** (duplicate name, too long, >20 specs) |
| `current-idp.html` (Delete) | Delete Current IDP | Cancel; **Deletion failed.** |
| `create-past-idp.html` | Create Past IDP | Required fields; Cancel; **Validation failed.** (future completion date, duplicate name) |
| `past-idp.html?id=…` | View Past IDP | **IDP not found.** |
| `update-past-idp.html?id=…` | Update Past IDP | Required fields; Cancel; **Validation failed.** |
| `past-idp.html` (Delete) | Delete Past IDP | Cancel; **Deletion failed.** |
| `past-idps.html` | Search Past IDP (and the portfolio list) | **Please enter a search query.**; **No matching IDP found.** |
| `analytics.html` | Portfolio Analytics | **No projects available to analyze.** |

### Customer — top navigation

| Page | Story | Alternate flows handled |
|---|---|---|
| `login.html` | Customer Login | Invalid credentials; account suspended |
| Top bar **Log out** | Customer Logout | Cancel; Session expired |
| `browse-projects.html` | Search IDP (and Customer Dashboard) | Please enter a search term; No IDP found |
| `project.html?id=…` | View IDP | Project not found or has been removed; Back → results / shortlist |
| `project.html` (Save button) | Save IDP | Project is already in your shortlist |
| `my-profile.html` | View Shortlist | Your shortlist is empty |
| `my-profile.html` (search bar) | Search Shortlist | Please enter a search term; No matching saved projects found |

### Platform Management — sidebar, lighter palette

| Page | Story | Alternate flows handled |
|---|---|---|
| `login.html` → `pm-dashboard.html` | PMS Login | Invalid credentials; account suspended |
| Sidebar **Log out** | PMS Logout | Cancel; Session expired |
| `categories.html` | View IDP Categories | No categories found. Please create one. |
| `create-category.html` | Create IDP Category | Required fields; Category with this name already exists. |
| `update-category.html?id=…` | Update IDP Category | Please fill in all required fields.; duplicate name |
| `categories.html` (Delete) | Delete IDP Category | Cancel; Cannot delete category. It is currently assigned to existing IDPs. |
| `categories.html` (search bar) | Search IDP Category | Please enter a search term.; No categories found matching your query. |
| `reports.html` → Daily | Daily Report | No data available for today.; Download PDF / CSV |
| `reports.html` → Weekly | Weekly Report | No data available for this week.; Download PDF / CSV |
| `reports.html` → Monthly | Monthly Report | No data available for this month.; Download PDF / CSV |

### Not a user story

| Page | What it is |
|---|---|
| `index.html` | **Homepage** (public). Left bar with the page sections, categories and other logins; **Log in** button at the top; platform numbers; recently completed IDPs (filter by category from the left bar); the top interior designers; how it works; a section for designers. Clicking a project goes through the customer login and then straight to that project. |
| `demo-data.html` | Download any CSV, or reload everything from the CSV files. Public, so a demo can be reset without logging in. |

## How the pieces connect

- **Views** — every time a customer opens a project page, a row is added to
  `project_views.csv`. Portfolio Analytics and all three reports count these.
- **Shortlists** — saves feed "Times shortlisted" and "Shortlists added" in the reports.
- **Modification log** — when a User Admin or Interior Designer changes something (accounts,
  profiles, company info, current and past IDPs), a row is added to `activity_log.csv` with the
  signed-in username. The Weekly report lists these; the Monthly report counts them per person.
- **Categories** — managed by Platform Management. Designers can tag a new project with
  one, and the customer project page shows it. A category used by any project cannot be deleted.
- **Visibility** — customers only see projects whose designer has company info, an active account
  and a profile that isn't suspended. Past IDPs (portfolio) are visible too, shown with "Completed <date>".
- **Deleting an IDP** — customers who shortlisted it keep the card, marked "No longer available".

## About the reports

- **Daily** — page views, unique visitors, shortlists added, views by hour, most viewed projects.
- **Weekly** — the 7 days ending on the chosen date: views and shortlists with % change vs the
  week before, a day-by-day trend, and the modification log (first 10 rows on screen, all in the CSV).
- **Monthly** — views, shortlists, projects started, traffic by Monday–Sunday week (weeks cut by
  the month's edge are marked *), and employee activity per designer and admin.
- **Sales** — the Monthly Report story mentions sales, but the platform has no sales or payments yet, so the report
  shows **"Not tracked"** rather than an invented number. Worth one line in the report document.
- **Download CSV** builds the file in the browser. **Download PDF** opens the print dialog with
  navigation hidden; choose **Save as PDF** there.
- Charts are plain HTML/CSS: one series each, the peak value labelled, a tooltip on hover or
  keyboard focus, and **Show as table** under every chart.

The demo traffic (`project_views.csv`, background rows in `shortlists.csv`, `activity_log.csv`) is
generated by `tools/generate_seed_activity.py` and covers **1 Sep – 30 Nov 2026** (Singapore time),
so the reports have data for any day of the semester. Re-running the script gives the same files.
Background shortlist saves come from anonymous visitors whose ids start with `v`; they are not
login accounts.

## Folder structure (BCE)

```
idp-frontend/
├── *.html                    Boundary — the pages
├── css/style.css             All styles (admin palette, lighter palette, charts, print)
├── data/                     The CSV "database" (8 tables; user_profiles.csv now has status,
│                             projects.csv has specifications, progressNote, completionDate)
│   ├── user_accounts.csv     user_profiles.csv     companies.csv       projects.csv
│   └── shortlists.csv        categories.csv        project_views.csv   activity_log.csv
├── tools/generate_seed_activity.py
└── js/
    ├── boundary/             Pages: displayPage / displayError / displaySuccess
    │   ├── …Page.js          one per user story (e.g. CreateCategoryPage.js, DailyReportPage.js)
    │   ├── ReportPanel.js    shared Generate / PDF / CSV behaviour for the three reports
    │   ├── LogoutPage.js     the logout dialog
    │   ├── UserAdminLogoutPage.js   one-click admin logout
    │   ├── ConfirmDialog.js  shared "Are you sure?" modal
    │   ├── Layout.js         sidebar or top nav, session check, loads the page's CSV tables
    │   └── ui.js             shared display helpers (banners, cards, charts, stat tiles, CSV download)
    ├── controller/           One per user story — all rules and alternate flows live here
    ├── entity/               UserAccount, UserProfile, CompanyInfo, Project, Shortlist,
    │                         Category, ProjectView, ActivityLog — private fields, getters/setters, save()
    ├── data/CsvStore.js      Reads/writes the CSV data
    └── util/                 validation.js (rules + Result), session.js, dates.js,
                              idp-rules.js (shared "Validation failed." checks for the Update Current IDP, Create Past IDP and Update Past IDP forms)
```

| Controller | Main method |
|---|---|
| CreateUserAccountController | `createUserAccount(username, password, email, phone, role)` |
| ViewUserAccountController | `getUserAccounts()`, `getUserAccount(id)` |
| UpdateUserAccountController | `updateUserAccount(id, username, email, phone, role, newPw, confirmPw)` |
| SuspendUserAccountController | `suspendUserAccount(id)` |
| SearchUserAccountController | `searchUserAccounts(field, term)` |
| CreateUserProfileController | `createUserProfile(accountId, first, last, address, company, regNo)` |
| ViewUserProfileController | `getUserProfiles()`, `getUserProfile(id)`, `getProfileForAccount(accountId)` |
| UpdateUserProfileController | `updateUserProfile(id, first, last, address, company, regNo)` |
| SuspendUserProfileController | `canSuspend(id)`, `suspendUserProfile(id)` |
| SearchUserProfileController | `searchUserProfiles(by, term)` — by = company / location |
| UserAdminLoginController | `login(username, password)` |
| UserAdminLogoutController | `logout()` |
| CreateCompanyInfoController | `createCompanyInfo(accountId, name, regNo, address, email, description)` |
| ViewCompanyInfoController | `getCompanyInfo(accountId)` |
| UpdateCompanyInfoController | `updateCompanyInfo(accountId, …)` |
| DeleteCompanyInfoController | `deleteCompanyInfo(accountId)` |
| SearchCompanyInfoController | `searchCompanyInfo(accountId, term)` |
| LoginController | `login(role, email, password)` |
| LogoutController | `logout()` |
| CreateCurrentProjectController | `createCurrentProject(accountId, name, customer, startDate, description, categoryId)` |
| ViewCurrentIDPController | `viewCurrentIDP(accountId, projectId)` |
| UpdateCurrentIDPController | `updateCurrentIDP(accountId, projectId, name, description, specifications)` |
| DeleteCurrentIDPController | `deleteCurrentIDP(accountId, projectId)` |
| SearchCurrentIDPController | `getCurrentIDPs(accountId)`, `searchCurrentIDP(accountId, query)` |
| CreatePastIDPController | `createPastIDP(accountId, name, description, completionDate)` |
| ViewPastIDPController | `viewPastIDP(accountId, projectId)` |
| UpdatePastIDPController | `updatePastIDP(accountId, projectId, name, description, completionDate)` |
| DeletePastIDPController | `deletePastIDP(accountId, projectId)` |
| SearchPastIDPController | `getPastIDPs(accountId)`, `searchPastIDP(accountId, query)` |
| SearchIDPController | `searchIDP(term)` |
| ViewIDPController | `viewIDP(accountId, projectId)` |
| SaveIDPController | `saveIDP(accountId, projectId)` |
| SearchShortlistController | `searchShortlist(accountId, term)` |
| ViewShortlistController | `getShortlist(accountId)` |
| ViewPortfolioAnalyticsController | `getPortfolioAnalytics(accountId, sortBy)` |
| CreateCategoryController | `createCategory(name, description)` |
| ViewCategoriesController | `getCategories()` |
| UpdateCategoryController | `updateCategory(id, name, description)` |
| DeleteCategoryController | `canDelete(id)`, `deleteCategory(id)` |
| SearchCategoryController | `searchCategories(term)` |
| GenerateDailyReportController | `generateDailyReport(dayKey)` |
| GenerateWeeklyReportController | `generateWeeklyReport(endDayKey)` |
| GenerateMonthlyReportController | `generateMonthlyReport(monthKey)` |

Flow for every story: **Page (boundary) → Controller → Entity → CsvStore**.

## Login and sessions

- Two login pages. `login.html` (role dropdown + email) for Interior Designer → designer dashboard,
  Customer → Browse Projects, Platform Management → PM dashboard. `admin-login.html` (username +
  password) for User Admins → admin dashboard.
- Logging out: User Admins log out in one click (no confirmation step); every other role
  confirms first.
- The session is kept in `sessionStorage`, so closing the tab logs you out. After 30 minutes without
  opening a page, the next page sends you to login with "Session expired. Please log in again."
- Each area checks the role: a customer cannot open designer or management pages, and so on.
  An expired or missing session goes to that area's login page.
  If an account is suspended while logged in, the next page logs the user out.

## How the CSV data is stored

1. On first load, `CsvStore` reads the `data/*.csv` files the page needs (`<body data-tables="…">`).
2. Changes are kept in the browser's `localStorage`, still as CSV text.
3. On `demo-data.html` (linked from both login pages as "Manage demo CSV data"),
   **Download CSV** gives you any updated file; copy it over the one in `data/` to keep it.
4. **Reload from CSV files** throws away browser changes and logs you out (useful before a demo).

Writing to a table a page did not load is blocked with an error, so a page can never overwrite a
CSV it only partly read. A browser cannot write files on disk by itself; that would need the
Python backend.

## Validation rules

| Field | Rule |
|---|---|
| Required fields | Marked with * on each form |
| Email | Must look like `name@domain.tld` |
| Phone | Optional; 8-digit Singapore number starting with 6, 8 or 9 |
| Password | At least 8 characters, including a number and a symbol |
| Username / Email | Unique across accounts (case-insensitive) |
| Registration Number | Letters and numbers, 4–15 characters; unique across companies |
| Category name | Unique (case-insensitive) |
| First / Last Name | Letters, spaces, hyphens, apostrophes |
| IDP name | Up to 100 characters; unique among the designer's own IDPs |
| IDP description | Up to 1,000 characters |
| Specifications | One per line, up to 20 |
| Past IDP completion date | A real date, today or earlier |
| Company info | One per Interior Designer |
| Start Date / report dates | Real calendar dates |

## Demo script — Interior Designer: company info and projects

1. Log in as `dkumar@example.com` / `Design#2027` (Interior Designer).
2. **My Projects → Create** shows the Create Current IDP precondition: no company info yet.
3. **Company Profile** shows "No company information found." Create one using registration
   number `2026XXXXXXK` → duplicate error. Change it → created.
4. Search `japandi` (or a word from your description) → the match is highlighted.
5. **Edit**, clear Address, Save → required-field error. Fix it → updated.
6. **My Projects → Create New Current Project** → leave Customer Name empty → error. Fill it → created as Current.
7. **Delete Company Info** → Cancel, then Delete → back on the dashboard. My Projects now notes
   the projects are hidden from customers.
8. **Log out** → Cancel, then Log out → login page.
9. Log in as `erahman@example.com` / `Manage#2026` (Platform Management) → suspended.

## Demo script — Customer

1. Log in as `cdavis@example.com` / `Shop#2026x` (Customer) → Browse Projects shows 6 featured projects.
2. Search with nothing typed → "Please enter a search term." Search `treehouse` → "No IDP found."
3. Search `kitchen` → 3 projects. Open **Scandinavian kitchen refresh** → images, designer, progress 40%.
4. **← Back to results** returns to the same 3 results.
5. Open it again → **Save to Shortlist** → My Shortlist shows 4 projects, the new one tagged "Just added".
6. Go back to the project and save again → "Project is already in your shortlist."
7. On My Shortlist, search `kitchen` → "2 of 4 saved projects match". Search `zebra` → no match. Clear.
8. Log out (Cancel first, then confirm). Log in as `ftan@example.com` / `Shop#2027x` → empty shortlist message.
9. Cross-role: as alee (admin dashboard, no login needed yet), suspend cdavis → her login now says
   "Your account has been suspended."

## Demo script — User Admin: profiles, login and logout

1. Open `admin-dashboard.html` → you're sent to the **Admin Portal**. Click Login with nothing typed → "Please
   enter your username and password." Try `alee` / `xxxxxxxx` → "Invalid username or password."
2. Log in as `alee` / `Admin#2026`.
3. **User Profiles** → View Profile on **bchen** (Tampines, Studio Example Pte Ltd).
4. **Edit Profile** → clear Address → error under the field. Type a digit in Last Name → "Validation failed."
   with the reason. Fix it → "Profile Updated Successfully".
5. Open **jong** → Suspend Profile → "Profile is already suspended." Open **ftan** → Suspend Profile →
   Cancel, then confirm. Her account stays Active (only the profile is hidden).
6. **Search Profiles** → Location `Tampines` → 2 profiles (bchen Active, jong Suspended).
7. **User Accounts** → dkumar → View Profile → "Profile not found for this user." → the link opens Create
   Profile with dkumar preselected.
8. **Log out** (no confirmation) → Admin Portal "You have been logged out."

## Demo script — Interior Designer: current and past IDPs

1. Log in as **bchen** → **My Projects**: Current IDPs · 4 with progress bars.
2. Search `kitchen` → "2 of 4 current IDPs match". Open **Scandinavian kitchen refresh** → progress
   "40% · design approved, carpentry next" and 4 specifications. The breadcrumb takes you back to the search.
3. Open **Punggol BTO kitchen & dining** → Update IDP → Save with empty Specifications → error. Rename it
   to `Scandinavian kitchen refresh` → "Validation failed." (duplicate). Add specifications → saved.
4. Open **Bukit Timah condo living room** → Delete IDP → Cancel, then delete → "IDP Deleted Successfully".
5. **Past IDPs (portfolio)** tab → search `kitchen` → "1 of 3 past IDPs matches".
6. **+ Create Past IDP** with a completion date in the future → "Validation failed." + "A past IDP's
   completion date can't be in the future." Use an earlier date → added to the portfolio.
7. Open **Compact kitchen, 3-room flat** → Update IDP → change the completion date → saved with
   "corrected from 12 Aug 2026".
8. Open **Café counter makeover** → Delete IDP → "Remove this project from your portfolio?" → delete.

## Demo script — Analytics, categories and reports

1. Log in as **bchen** → Company Profile → **Portfolio Analytics**: views and shortlists per project.
   Switch **Sort by** to Shortlisted. (dkumar sees "No projects available to analyze.")
2. Log out. Log in as **erahman** (Platform Management) → "Your account has been suspended."
3. Log in as **gwong** → Platform Management Dashboard.
4. **Category Management**: 6 categories. Search with nothing typed, then `room` (3 matches), then `garage` (none).
5. **+ Create New Category** → name `kitchen` → duplicate error. Name `Outdoor` → created.
6. **Edit** Home Office: clear the description → error; rename to `Bedroom` → duplicate;
   rename to `Home Office & Study` → updated.
7. **Delete** Kitchen → "Cannot delete category…" (3 IDPs use it). **Delete** Commercial → Cancel, then delete.
8. **Reports → Daily**: pick 31 Oct 2026 → Generate. Hover the bars. Try 15 Jun 2026 → no data.
   **Download CSV** and **Download PDF**.
9. **Weekly**: week ending 1 Nov 2026 → views up vs the week before, plus the modification log.
10. **Monthly**: October 2026 → traffic by week, Sales "Not tracked", employee activity.
11. Cross-role: as a customer open a project, then reload bchen's Portfolio Analytics; the view count goes up by 1.

## Gaps worth mentioning in the report

- **Progress can't be changed.** Customers see a progress bar and designers see it on View Current IDP,
  but no use case lets a designer update progress. Update Current IDP only edits Name, Description and Specifications.
- **Sales (Monthly Report)** — the platform has no sales data, so the Monthly report shows "Not tracked".
- **View Shortlist** has diagrams but no use case description in the report document.
- Passwords are stored as plain text in the CSV because this is a front-end prototype.
  A real system would hash them in the backend.
