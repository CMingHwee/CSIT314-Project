"""
Generates the demo activity data used by Portfolio Analytics and the
Daily / Weekly / Monthly reports:

    data/project_views.csv   one row per project page view
    data/shortlists.csv      cdavis's 3 saved projects + background saves
    data/activity_log.csv    changes made by designers and user admins

The output is deterministic (fixed random seed), so re-running gives the same files.
Times are generated in Singapore time (UTC+8) and stored as UTC ISO timestamps.

    python tools/generate_seed_activity.py
"""
import csv
import random
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

random.seed(314)
DATA = Path(__file__).resolve().parent.parent / "data"
SGT = timezone(timedelta(hours=8))
START, END = date(2026, 9, 1), date(2026, 11, 30)

# project id -> (first day it can be viewed, relative popularity)
PROJECTS = {
    "1": (date(2026, 10, 12), 1.6),   # Scandinavian kitchen refresh
    "2": (START, 1.0),                # Compact kitchen, 3-room flat
    "3": (START, 1.3),                # Warm minimalist living room
    "4": (START, 1.2),                # Japandi master bedroom
    "5": (START, 0.6),                # Home office nook
    "6": (date(2026, 10, 20), 1.1),   # Bright open-plan kitchen
}

# Projects added later (current/past IDP demo data). They use their own random stream, so the
# traffic of projects 1-6 above stays exactly the same as before they were added.
LATER_PROJECTS = {
    "7": (date(2026, 11, 2), 0.9),    # Punggol BTO kitchen & dining
    "8": (date(2026, 9, 20), 0.8),    # Bukit Timah condo living room
    "9": (date(2026, 10, 5), 0.7),    # Serangoon master bathroom
    "10": (START, 0.4),               # Café counter makeover (past)
    "11": (START, 0.5),               # Sengkang family room refresh (past)
}

# Share of a day's views falling in each hour (busy evenings, quiet nights).
HOURLY = [1, 0.6, 0.3, 0.2, 0.2, 0.3, 0.8, 1.6, 2.4, 2.8, 3.0, 3.2,
          3.6, 3.4, 3.0, 2.9, 3.1, 3.5, 4.2, 5.0, 5.4, 5.0, 3.6, 2.0]


def iso(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def random_time(day):
    hour = random.choices(range(24), weights=HOURLY)[0]
    return datetime(day.year, day.month, day.day, hour,
                    random.randrange(60), random.randrange(60), tzinfo=SGT)


views, saves = [], []
day = START
while day <= END:
    trend = 1 + (day - START).days / 120          # traffic grows over the semester
    weekend = 1.35 if day.weekday() >= 5 else 1.0
    for pid, (first, pop) in PROJECTS.items():
        if day < first:
            continue
        n = max(0, round(random.gauss(9 * pop * trend * weekend, 2.5)))
        for _ in range(n):
            t = random_time(day)
            visitor = f"v{random.randint(1, 420):03d}"
            views.append((t, pid, visitor))
            if random.random() < 0.035:              # about 1 in 30 views ends in a save
                saves.append((t + timedelta(minutes=random.randint(1, 20)), pid, visitor))
    day += timedelta(days=1)

rng = random.Random(2026)
day = START
while day <= END:
    trend = 1 + (day - START).days / 120
    weekend = 1.35 if day.weekday() >= 5 else 1.0
    for pid, (first, pop) in LATER_PROJECTS.items():
        if day < first:
            continue
        n = max(0, round(rng.gauss(9 * pop * trend * weekend, 2.5)))
        for _ in range(n):
            hour = rng.choices(range(24), weights=HOURLY)[0]
            t = datetime(day.year, day.month, day.day, hour, rng.randrange(60), rng.randrange(60), tzinfo=SGT)
            visitor = f"v{rng.randint(1, 420):03d}"
            views.append((t, pid, visitor))
            if rng.random() < 0.035:
                saves.append((t + timedelta(minutes=rng.randint(1, 20)), pid, visitor))
    day += timedelta(days=1)

views.sort()
with open(DATA / "project_views.csv", "w", newline="") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(["id", "projectId", "visitorId", "viewedAt"])
    for i, (t, pid, visitor) in enumerate(views, 1):
        w.writerow([i, pid, visitor, iso(t)])

# Shortlists: cdavis (account 3) keeps ids 1-3 so the shortlist demo is unchanged.
# Background saves come from visitors who are not demo accounts (ids start with "v").
seen = set()
rows = [
    (1, "3", "3", "2026-10-28T10:15:00Z"),
    (2, "3", "4", "2026-10-29T14:02:00Z"),
    (3, "3", "2", "2026-10-30T09:40:00Z"),
]
saves.sort()
for t, pid, visitor in saves:
    if (visitor, pid) in seen:
        continue
    seen.add((visitor, pid))
    rows.append((len(rows) + 1, visitor, pid, iso(t)))
with open(DATA / "shortlists.csv", "w", newline="") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(["id", "accountId", "projectId", "savedAt"])
    w.writerows(rows)

# Modification log by Interior Designers and User Admins (Weekly and Monthly reports).
STAFF = {
    "1": ("alee", "User Admin"),
    "2": ("bchen", "Interior Designer"),
    "6": ("otan", "Interior Designer"),
    "7": ("njames", "Interior Designer"),
}
EVENTS = [
    ("2026-09-02 09:12", "1", "Created account", "otan (Interior Designer)"),
    ("2026-09-02 09:20", "1", "Created account", "njames (Interior Designer)"),
    ("2026-09-03 14:05", "6", "Created company info", "Oakline Design"),
    ("2026-09-04 10:41", "7", "Created company info", "Northlight Interiors"),
    ("2026-09-05 16:30", "6", "Created current IDP", "Warm minimalist living room"),
    ("2026-09-08 11:02", "7", "Created current IDP", "Japandi master bedroom"),
    ("2026-09-15 15:47", "2", "Updated company info", "Studio Example Pte Ltd"),
    ("2026-09-22 10:18", "1", "Created account", "ftan (Customer)"),
    ("2026-09-29 13:55", "6", "Updated IDP", "Warm minimalist living room"),
    ("2026-10-03 09:33", "1", "Created profile", "cdavis"),
    ("2026-10-06 17:20", "7", "Updated IDP", "Japandi master bedroom"),
    ("2026-10-12 10:02", "2", "Created current IDP", "Scandinavian kitchen refresh"),
    ("2026-10-14 15:26", "6", "Updated company info", "Oakline Design"),
    ("2026-10-16 11:48", "1", "Updated account", "dkumar (Interior Designer)"),
    ("2026-10-20 09:10", "7", "Created current IDP", "Bright open-plan kitchen"),
    ("2026-10-21 14:37", "2", "Updated IDP", "Scandinavian kitchen refresh"),
    ("2026-10-23 16:59", "6", "Updated IDP", "Warm minimalist living room"),
    ("2026-10-26 10:22", "7", "Updated IDP", "Bright open-plan kitchen"),
    ("2026-10-27 13:08", "2", "Updated IDP", "Scandinavian kitchen refresh"),
    ("2026-10-28 10:05", "7", "Updated company info", "Northlight Interiors"),
    ("2026-10-29 14:22", "1", "Created account", "gwong (Platform Management)"),
    ("2026-10-30 09:15", "2", "Updated IDP", "Scandinavian kitchen refresh"),
    ("2026-10-31 11:40", "1", "Updated account", "erahman (Platform Management)"),
    ("2026-10-31 16:02", "6", "Updated IDP", "Warm minimalist living room"),
    ("2026-11-02 10:30", "7", "Updated IDP", "Japandi master bedroom"),
    # Profile and IDP demo data
    ("2026-09-10 10:15", "2", "Created past IDP", "Café counter makeover"),
    ("2026-09-12 14:40", "2", "Created past IDP", "Sengkang family room refresh"),
    ("2026-09-20 09:30", "2", "Created current IDP", "Bukit Timah condo living room"),
    ("2026-10-05 11:20", "2", "Created current IDP", "Serangoon master bathroom"),
    ("2026-10-08 10:00", "1", "Created account", "jong (Interior Designer)"),
    ("2026-10-08 10:12", "1", "Created profile", "jong"),
    ("2026-10-24 15:30", "1", "Suspended profile", "jong"),
    ("2026-11-02 09:05", "2", "Created current IDP", "Punggol BTO kitchen & dining"),
]
EVENTS.sort(key=lambda e: e[0])
with open(DATA / "activity_log.csv", "w", newline="") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(["id", "timestamp", "accountId", "username", "role", "action", "item"])
    for i, (when, acc, action, item) in enumerate(EVENTS, 1):
        t = datetime.strptime(when, "%Y-%m-%d %H:%M").replace(tzinfo=SGT)
        username, role = STAFF[acc]
        w.writerow([i, iso(t), acc, username, role, action, item])

print(f"project_views.csv: {len(views)} rows")
print(f"shortlists.csv:    {len(rows)} rows")
print(f"activity_log.csv:  {len(EVENTS)} rows")
