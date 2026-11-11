import csv
from pathlib import Path
from datetime import datetime, timezone

from entity.IDP import IDP
from entity.Shortlist import Shortlist


BASE_PATH = Path(__file__).resolve().parents[2]

PROJECT_FILE = BASE_PATH / "idp-frontend" / "data" / "projects.csv"
ACCOUNT_FILE = BASE_PATH / "idp-frontend" / "data" / "user_accounts.csv"
COMPANY_FILE = BASE_PATH / "idp-frontend" / "data" / "companies.csv"
PROFILE_FILE = BASE_PATH / "idp-frontend" / "data" / "user_profiles.csv"
SHORTLIST_FILE = BASE_PATH / "idp-frontend" / "data" / "shortlists.csv"
VIEW_FILE = BASE_PATH / "idp-frontend" / "data" / "project_views.csv"


def readCSV(file):
    with open(file, "r", newline="", encoding="utf-8-sig") as csvFile:
        return list(csv.DictReader(csvFile))


def writeCSV(file, rows, fieldnames):
    with open(file, "w", newline="", encoding="utf-8") as csvFile:
        writer = csv.DictWriter(csvFile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def getNextID(rows):
    if not rows:
        return "1"

    return str(max(int(row["id"]) for row in rows) + 1)


def createIDPObject(row):
    return IDP(
        row["id"],
        row["accountId"],
        row["categoryId"],
        row["projectName"],
        row["customerName"],
        row["startDate"],
        row["description"],
        row["specifications"],
        row["progress"],
        row["completionDate"],
        row["status"],
        0,
        0
    )


def createShortlistObject(row):
    return Shortlist(
        row["id"],
        row["accountId"],
        row["projectId"]
    )


def isVisibleToCustomers(accountID, companies, accounts, profiles):
    companyExists = any(
        company["accountId"] == accountID
        for company in companies
    )

    if not companyExists:
        return False

    account = next(
        (account for account in accounts
         if account["id"] == accountID),
        None
    )

    if account is None or account["status"] != "Active":
        return False

    profile = next(
        (profile for profile in profiles
         if profile["accountId"] == accountID),
        None
    )

    if profile is not None and profile["status"] == "Suspended":
        return False

    return True


def getCompanyName(accountID, companies):
    company = next(
        (company for company in companies
         if company["accountId"] == accountID),
        None
    )

    return company["companyName"] if company else ""


def isProjectVisible(project, companies, accounts, profiles):
    return isVisibleToCustomers(
        project["accountId"], companies, accounts, profiles
    )


# US32 - Search IDP

class SearchIDPController:

    def searchIDP(self, query):

        query = str(query).strip().lower()

        if query == "":
            return None

        projects = readCSV(PROJECT_FILE)
        accounts = readCSV(ACCOUNT_FILE)
        companies = readCSV(COMPANY_FILE)
        profiles = readCSV(PROFILE_FILE)

        results = []

        for project in projects:

            accountID = project["accountId"]

            if not isProjectVisible(
                project, companies, accounts, profiles
            ):
                continue

            companyName = getCompanyName(accountID, companies)

            if (
                query in project["projectName"].lower()
                or query in project["description"].lower()
                or query in companyName.lower()
            ):
                results.append(createIDPObject(project))

        return results


# US33 - View IDP

class ViewIDPController:

    def viewIDP(self, customerID, idpID):

        projects = readCSV(PROJECT_FILE)
        accounts = readCSV(ACCOUNT_FILE)
        companies = readCSV(COMPANY_FILE)
        profiles = readCSV(PROFILE_FILE)

        project = next(
            (project for project in projects
             if project["id"] == str(idpID)),
            None
        )

        if project is None:
            return None

        if not isProjectVisible(
            project, companies, accounts, profiles
        ):
            return None

        views = readCSV(VIEW_FILE)

        viewID = getNextID(views)

        viewedAt = datetime.now(timezone.utc).isoformat(
            timespec="seconds"
        ).replace("+00:00", "Z")

        views.append({
            "id": viewID,
            "projectId": str(idpID),
            "visitorId": "a" + str(customerID),
            "viewedAt": viewedAt
        })

        writeCSV(
            VIEW_FILE,
            views,
            ["id", "projectId", "visitorId", "viewedAt"]
        )

        return createIDPObject(project)


# US34 - Save IDP to Shortlist

class SaveIDPController:

    def saveIDP(self, customerID, idpID):

        projects = readCSV(PROJECT_FILE)
        accounts = readCSV(ACCOUNT_FILE)
        companies = readCSV(COMPANY_FILE)
        profiles = readCSV(PROFILE_FILE)

        project = next(
            (project for project in projects
             if project["id"] == str(idpID)),
            None
        )

        if project is None:
            return False

        if not isProjectVisible(
            project, companies, accounts, profiles
        ):
            return False

        shortlists = readCSV(SHORTLIST_FILE)

        alreadySaved = any(
            row["accountId"] == str(customerID)
            and row["projectId"] == str(idpID)
            for row in shortlists
        )

        if alreadySaved:
            return False

        shortlistID = getNextID(shortlists)

        savedAt = datetime.now(timezone.utc).isoformat(
            timespec="seconds"
        ).replace("+00:00", "Z")

        shortlists.append({
            "id": shortlistID,
            "accountId": str(customerID),
            "projectId": str(idpID),
            "savedAt": savedAt
        })

        writeCSV(
            SHORTLIST_FILE,
            shortlists,
            ["id", "accountId", "projectId", "savedAt"]
        )

        return True


# US35 - Search Shortlist

class SearchShortlistController:

    def searchShortlist(self, customerID, query):

        query = str(query).strip().lower()

        if query == "":
            return None

        shortlists = readCSV(SHORTLIST_FILE)
        projects = readCSV(PROJECT_FILE)
        companies = readCSV(COMPANY_FILE)

        results = []

        customerShortlists = [
            row for row in shortlists
            if row["accountId"] == str(customerID)
        ]

        for shortlist in customerShortlists:

            project = next(
                (project for project in projects
                 if project["id"] == shortlist["projectId"]),
                None
            )

            if project is None:
                continue

            companyName = getCompanyName(
                project["accountId"], companies
            )

            if (
                query in project["projectName"].lower()
                or query in project["description"].lower()
                or query in companyName.lower()
            ):
                results.append(createIDPObject(project))

        return results


# US36 - View Shortlist

class ViewShortlistController:

    def viewShortlist(self, customerID):

        shortlists = readCSV(SHORTLIST_FILE)
        projects = readCSV(PROJECT_FILE)
        accounts = readCSV(ACCOUNT_FILE)
        companies = readCSV(COMPANY_FILE)
        profiles = readCSV(PROFILE_FILE)

        customerShortlists = [
            row for row in shortlists
            if row["accountId"] == str(customerID)
        ]

        customerShortlists.sort(
            key=lambda row: row["savedAt"],
            reverse=True
        )

        results = []

        for row in customerShortlists:

            project = next(
                (project for project in projects
                 if project["id"] == row["projectId"]),
                None
            )

            available = (
                project is not None
                and isProjectVisible(
                    project, companies, accounts, profiles
                )
            )

            results.append({
                "shortlist": createShortlistObject(row),
                "project": createIDPObject(project) if project else None,
                "available": available
            })

        return results
