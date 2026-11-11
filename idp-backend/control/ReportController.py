import csv
import calendar
from datetime import date, datetime, timedelta
from pathlib import Path

from entity.Report import Report


BASE_PATH = Path(__file__).resolve().parents[2]
DATA_PATH = BASE_PATH / "idp-frontend" / "data"

VIEW_FILE = DATA_PATH / "project_views.csv"
SHORTLIST_FILE = DATA_PATH / "shortlists.csv"
PROJECT_FILE = DATA_PATH / "projects.csv"
ACTIVITY_FILE = DATA_PATH / "activity_log.csv"
ACCOUNT_FILE = DATA_PATH / "user_accounts.csv"
COMPANY_FILE = DATA_PATH / "companies.csv"


def readCSV(filePath):
    if not filePath.exists():
        return []

    with open(filePath, "r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def parseDate(value):
    try:
        return date.fromisoformat(value[:10])
    except (ValueError, TypeError):
        return None


def parseDateTime(value):
    try:
        timestamp = datetime.fromisoformat(value.replace("Z", "+00:00"))

        if timestamp.tzinfo is not None:
            timestamp = timestamp.astimezone()

        return timestamp

    except (ValueError, TypeError):
        return None


def isWithin(value, startDate, endDate):
    timestamp = parseDateTime(value)

    if timestamp is None:
        return False

    return startDate <= timestamp.date() < endDate


def getNextDate(currentDate, days):
    return currentDate + timedelta(days=days)


def getPercentChange(currentValue, previousValue):
    if previousValue == 0:
        return None

    return round(((currentValue - previousValue) / previousValue) * 100)


def createReport(reportType, reportDate, trafficData,
                 modificationLogs=None, employeePerformance=None):

    reportID = reportType.upper() + "-" + reportDate

    report = Report(
        reportID,
        reportType,
        datetime.now().astimezone().isoformat(),
        trafficData,
        modificationLogs or [],
        employeePerformance or []
    )

    return report


def createResult(report, data):
    return {
        "success": True,
        "message": "",
        "report": report,
        "data": data
    }


def createError(message, field=None):
    result = {
        "success": False,
        "message": message
    }

    if field:
        result["fieldErrors"] = {field: message}

    return result


def getProjectMaps():
    projects = readCSV(PROJECT_FILE)
    companies = readCSV(COMPANY_FILE)

    companyNames = {
        row["accountId"]: row["companyName"]
        for row in companies
    }

    projectMap = {}

    for project in projects:
        projectMap[project["id"]] = {
            "projectName": project["projectName"],
            "accountId": project["accountId"],
            "designer": companyNames.get(project["accountId"], "—"),
            "startDate": project["startDate"]
        }

    return projects, projectMap


def getViews(startDate, endDate):
    return [
        view for view in readCSV(VIEW_FILE)
        if isWithin(view["viewedAt"], startDate, endDate)
    ]


def getShortlists(startDate, endDate):
    return [
        shortlist for shortlist in readCSV(SHORTLIST_FILE)
        if isWithin(shortlist["savedAt"], startDate, endDate)
    ]


def getActivityLogs(startDate, endDate):
    return [
        log for log in readCSV(ACTIVITY_FILE)
        if isWithin(log["timestamp"], startDate, endDate)
    ]


class GenerateDailyReportController:

    def generateDailyReport(self, dayKey=None):

        if dayKey is None:
            dayKey = date.today().isoformat()

        selectedDate = parseDate(dayKey)

        if selectedDate is None or len(dayKey) != 10:
            return createError("Please choose a valid date.", "day")

        startDate = selectedDate
        endDate = getNextDate(selectedDate, 1)

        isToday = selectedDate == date.today()

        views = getViews(startDate, endDate)
        saves = getShortlists(startDate, endDate)

        if not views and not saves:
            if isToday:
                message = "No data available for today."
            else:
                message = "No data available for " + selectedDate.strftime("%d %b %Y") + "."

            return createError(message)

        # Count views by hour.

        byHour = [0] * 24

        for view in views:
            timestamp = parseDateTime(view["viewedAt"])

            if timestamp is not None:
                byHour[timestamp.hour] += 1

        # Count views and shortlists for each project.

        perProject = {}

        for view in views:
            projectID = view["projectId"]

            if projectID not in perProject:
                perProject[projectID] = {
                    "views": 0,
                    "shortlisted": 0
                }

            perProject[projectID]["views"] += 1

        for save in saves:
            projectID = save["projectId"]

            if projectID not in perProject:
                perProject[projectID] = {
                    "views": 0,
                    "shortlisted": 0
                }

            perProject[projectID]["shortlisted"] += 1

        _, projectMap = getProjectMaps()

        topProjects = []

        for projectID, counts in perProject.items():
            project = projectMap.get(projectID)

            if project is None:
                projectName = "Removed project"
                designer = "—"
            else:
                projectName = project["projectName"]
                designer = project["designer"]

            topProjects.append({
                "name": projectName,
                "designer": designer,
                "views": counts["views"],
                "shortlisted": counts["shortlisted"]
            })

        topProjects.sort(
            key=lambda project: (
                project["views"],
                project["shortlisted"]
            ),
            reverse=True
        )

        topProjects = topProjects[:5]

        uniqueVisitors = len({
            view["visitorId"] for view in views
        })

        data = {
            "dayKey": dayKey,
            "title": (
                "Today · " + selectedDate.strftime("%d %b %Y")
                if isToday
                else selectedDate.strftime("%d %b %Y")
            ),
            "pageViews": len(views),
            "uniqueVisitors": uniqueVisitors,
            "shortlistsAdded": len(saves),
            "byHour": byHour,
            "topProjects": topProjects
        }

        trafficData = [
            {
                "pageViews": len(views),
                "uniqueVisitors": uniqueVisitors,
                "shortlistsAdded": len(saves),
                "byHour": byHour,
                "topProjects": topProjects
            }
        ]

        report = createReport(
            "Daily",
            dayKey,
            trafficData
        )

        return createResult(report, data)


class GenerateWeeklyReportController:

    def generateWeeklyReport(self, endDayKey=None):

        if endDayKey is None:
            endDayKey = date.today().isoformat()

        lastDate = parseDate(endDayKey)

        if lastDate is None or len(endDayKey) != 10:
            return createError("Please choose a valid date.", "week")

        startDate = getNextDate(lastDate, -6)
        endDate = getNextDate(lastDate, 1)
        previousStart = getNextDate(startDate, -7)

        views = getViews(startDate, endDate)
        previousViews = getViews(previousStart, startDate)

        saves = getShortlists(startDate, endDate)
        previousSaves = getShortlists(previousStart, startDate)

        modifications = getActivityLogs(startDate, endDate)

        modifications = [
            log for log in modifications
            if log["role"] in ("Interior Designer", "User Admin")
        ]

        if not views and not saves and not modifications:
            return createError("No data available for this week.")

        # Generate the view count for each day.

        byDay = []

        for i in range(7):
            currentDate = getNextDate(startDate, i)
            nextDate = getNextDate(currentDate, 1)

            dailyViews = getViews(currentDate, nextDate)

            byDay.append({
                "label": currentDate.strftime("%A"),
                "dayKey": currentDate.isoformat(),
                "views": len(dailyViews)
            })

        viewsChange = getPercentChange(
            len(views),
            len(previousViews)
        )

        shortlistsChange = getPercentChange(
            len(saves),
            len(previousSaves)
        )

        title = (
            startDate.strftime("%d %b %Y")
            + " – "
            + lastDate.strftime("%d %b %Y")
        )

        data = {
            "endDayKey": endDayKey,
            "title": title,
            "views": len(views),
            "viewsChange": viewsChange,
            "shortlistsAdded": len(saves),
            "shortlistsChange": shortlistsChange,
            "modificationCount": len(modifications),
            "byDay": byDay,
            "modifications": modifications
        }

        trafficData = [
            {
                "views": len(views),
                "viewsChange": viewsChange,
                "shortlistsAdded": len(saves),
                "shortlistsChange": shortlistsChange,
                "byDay": byDay
            }
        ]

        report = createReport(
            "Weekly",
            endDayKey,
            trafficData,
            modifications
        )

        return createResult(report, data)


class GenerateMonthlyReportController:

    def generateMonthlyReport(self, monthKey=None):

        if monthKey is None:
            monthKey = date.today().strftime("%Y-%m")

        try:
            selectedMonth = datetime.strptime(monthKey, "%Y-%m").date()

            if selectedMonth.strftime("%Y-%m") != monthKey:
                raise ValueError

        except (ValueError, TypeError):
            return createError("Please choose a valid month.", "month")

        startDate = selectedMonth.replace(day=1)

        lastDay = calendar.monthrange(
            selectedMonth.year,
            selectedMonth.month
        )[1]

        endDate = startDate.replace(day=lastDay) + timedelta(days=1)

        views = getViews(startDate, endDate)
        saves = getShortlists(startDate, endDate)
        modifications = getActivityLogs(startDate, endDate)

        projects, projectMap = getProjectMaps()

        projectsStarted = sum(
            1 for project in projects
            if project["startDate"].startswith(monthKey)
        )

        if not views and not saves and not modifications:
            return createError("No data available for this month.")

        # Group traffic by week, starting on Monday.

        byWeek = []
        weekStart = startDate

        while weekStart < endDate:

            daysToMonday = (8 - weekStart.weekday()) % 7

            if daysToMonday == 0:
                daysToMonday = 7

            weekEnd = min(
                getNextDate(weekStart, daysToMonday),
                endDate
            )

            weekViews = getViews(weekStart, weekEnd)

            lastWeekDay = weekEnd - timedelta(days=1)
            numberOfDays = (weekEnd - weekStart).days

            byWeek.append({
                "label": (
                    str(weekStart.day)
                    + "–"
                    + str(lastWeekDay.day)
                    + " "
                    + weekStart.strftime("%B")
                ),
                "views": len(weekViews),
                "partial": numberOfDays < 7
            })

            weekStart = weekEnd

        # Count views for each project.

        viewsByProject = {}

        for view in views:
            projectID = view["projectId"]

            viewsByProject[projectID] = (
                viewsByProject.get(projectID, 0) + 1
            )

        # Generate employee performance information.

        accounts = readCSV(ACCOUNT_FILE)

        staff = []

        for account in accounts:

            role = account["role"]

            if role not in ("Interior Designer", "User Admin"):
                continue

            accountID = account["id"]

            accountLogs = [
                log for log in modifications
                if log["accountId"] == accountID
            ]

            isDesigner = role == "Interior Designer"

            projectsCreated = None
            viewsOnIDPs = None

            if isDesigner:

                projectsCreated = sum(
                    1 for log in accountLogs
                    if log["action"] == "Created current IDP"
                )

                designerProjects = [
                    project for project in projects
                    if project["accountId"] == accountID
                ]

                viewsOnIDPs = sum(
                    viewsByProject.get(project["id"], 0)
                    for project in designerProjects
                )

            staffMember = {
                "username": account["username"],
                "role": role,
                "actions": len(accountLogs),
                "projectsCreated": projectsCreated,
                "viewsOnIDPs": viewsOnIDPs
            }

            if staffMember["actions"] > 0 or (
                viewsOnIDPs is not None and viewsOnIDPs > 0
            ):
                staff.append(staffMember)

        staff.sort(
            key=lambda member: (
                member["actions"],
                member["viewsOnIDPs"] or 0
            ),
            reverse=True
        )

        data = {
            "monthKey": monthKey,
            "title": selectedMonth.strftime("%B %Y"),
            "platformViews": len(views),
            "shortlistsAdded": len(saves),
            "projectsStarted": projectsStarted,
            "sales": None,
            "byWeek": byWeek,
            "staff": staff
        }

        trafficData = [
            {
                "platformViews": len(views),
                "shortlistsAdded": len(saves),
                "projectsStarted": projectsStarted,
                "sales": None,
                "byWeek": byWeek
            }
        ]

        report = createReport(
            "Monthly",
            monthKey,
            trafficData,
            modifications,
            staff
        )

        return createResult(report, data)
