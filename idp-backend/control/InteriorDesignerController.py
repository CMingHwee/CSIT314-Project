import csv
from pathlib import Path

from entity.IDP import IDP


BASE_PATH = Path(__file__).resolve().parents[2]

PROJECT_FILE = BASE_PATH / "idp-frontend" / "data" / "projects.csv"
VIEW_FILE = BASE_PATH / "idp-frontend" / "data" / "project_views.csv"
SHORTLIST_FILE = BASE_PATH / "idp-frontend" / "data" / "shortlists.csv"


def readCSV(file):
    with open(file, "r", newline="", encoding="utf-8-sig") as csvFile:
        return list(csv.DictReader(csvFile))


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


class viewIDPAnalyticsController:

    def viewIDPAnalytics(self, accountID, sortBy="views"):

        projects = readCSV(PROJECT_FILE)
        views = readCSV(VIEW_FILE)
        shortlists = readCSV(SHORTLIST_FILE)

        # Retrieve only the projects belonging to this designer.
        designerProjects = [
            project for project in projects
            if project["accountId"] == str(accountID)
        ]

        if len(designerProjects) == 0:
            return {
                "success": False,
                "message": "No projects available to analyze."
            }

        # Count the number of views for each project.
        viewCounts = {}

        for view in views:
            projectID = view["projectId"]
            viewCounts[projectID] = viewCounts.get(projectID, 0) + 1

        # Count the number of times each project was shortlisted.
        shortlistCounts = {}

        for shortlist in shortlists:
            projectID = shortlist["projectId"]
            shortlistCounts[projectID] = shortlistCounts.get(projectID, 0) + 1

        # Combine each project with its view and shortlist counts.
        rows = []

        for project in designerProjects:
            projectID = project["id"]

            rows.append({
                "project": createIDPObject(project),
                "views": viewCounts.get(projectID, 0),
                "shortlisted": shortlistCounts.get(projectID, 0)
            })

        # Select the sorting method.
        if sortBy not in ["views", "shortlisted"]:
            sortBy = "views"

        # Use the other count as a secondary sorting method.
        if sortBy == "views":
            otherSort = "shortlisted"
        else:
            otherSort = "views"

        rows.sort(
            key=lambda row: (row[sortBy], row[otherSort]),
            reverse=True
        )

        # Calculate the total views and shortlist counts.
        totalViews = sum(row["views"] for row in rows)

        totalShortlisted = sum(
            row["shortlisted"] for row in rows
        )

        return {
            "success": True,
            "message": "",
            "rows": rows,
            "sortBy": sortBy,
            "totalViews": totalViews,
            "totalShortlisted": totalShortlisted,
            "projectCount": len(rows)
        }
