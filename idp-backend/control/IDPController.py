import csv
from pathlib import Path
from datetime import date

from entity.IDP import IDP


BASE_PATH = Path(__file__).resolve().parents[2]
PROJECT_FILE = BASE_PATH / "idp-frontend" / "data" / "projects.csv"

FIELDNAMES = [
    "id",
    "accountId",
    "projectName",
    "customerName",
    "startDate",
    "description",
    "status",
    "progress",
    "categoryId",
    "specifications",
    "progressNote",
    "completionDate",
    "images"
]


def readCSV():
    with open(PROJECT_FILE, "r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def writeCSV(rows):
    with open(PROJECT_FILE, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


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


def getNextIDPID(projects):
    if not projects:
        return "1"

    return str(max(int(project["id"]) for project in projects) + 1)


def findCurrentIDP(projects, designerID, idpID):
    for project in projects:
        if (
            project["accountId"] == str(designerID)
            and project["id"] == str(idpID)
            and project["status"] == "Current"
        ):
            return project

    return None


def findPastIDP(projects, designerID, idpID):
    for project in projects:
        if (
            project["accountId"] == str(designerID)
            and project["id"] == str(idpID)
            and project["status"] == "Past"
        ):
            return project

    return None


# Current IDP Controllers (US20–24)

class CreateCurrentIDPController:

    def createCurrentIDP(self, designerID, projectName, customerName, startDate, description) -> bool:
        designerID = str(designerID)

        projectName = projectName.strip()
        customerName = customerName.strip()
        startDate = startDate.strip()
        description = description.strip()

        if not all([projectName, customerName, startDate, description]):
            return False

        projects = readCSV()

        for project in projects:
            if (
                project["accountId"] == designerID
                and project["projectName"].lower() == projectName.lower()
            ):
                return False

        idpID = getNextIDPID(projects)

        idp = IDP(
            idpID,
            designerID,
            "",
            projectName,
            customerName,
            startDate,
            description,
            "",
            "0",
            "",
            "Current",
            0,
            0
        )

        projects.append({
            "id": idp.idpID,
            "accountId": idp.designerID,
            "projectName": idp.projectName,
            "customerName": idp.customerName,
            "startDate": idp.startDate,
            "description": idp.description,
            "status": idp.status,
            "progress": str(idp.progress),
            "categoryId": idp.categoryID,
            "specifications": idp.specification,
            "progressNote": "",
            "completionDate": idp.completionDate,
            "images": ""
        })

        writeCSV(projects)

        return True


class ViewCurrentIDPController:

    def viewCurrentIDP(self, designerID, idpID) -> IDP:
        projects = readCSV()

        project = findCurrentIDP(projects, designerID, idpID)

        if project is None:
            return None

        return createIDPObject(project)


class UpdateCurrentIDPController:

    def updateCurrentIDP(self, designerID, idpID, projectName, description, specifications) -> bool:
        projectName = projectName.strip()
        description = description.strip()
        specifications = specifications.strip()

        if not all([projectName, description, specifications]):
            return False

        projects = readCSV()

        project = findCurrentIDP(projects, designerID, idpID)

        if project is None:
            return False

        for otherProject in projects:
            if (
                otherProject["accountId"] == str(designerID)
                and otherProject["id"] != str(idpID)
                and otherProject["projectName"].lower() == projectName.lower()
            ):
                return False

        idp = createIDPObject(project)

        idp.projectName = projectName
        idp.description = description
        idp.specification = specifications

        project["projectName"] = idp.projectName
        project["description"] = idp.description
        project["specifications"] = idp.specification

        writeCSV(projects)

        return True


class DeleteCurrentIDPController:

    def deleteCurrentIDP(self, designerID, idpID) -> bool:
        projects = readCSV()

        project = findCurrentIDP(projects, designerID, idpID)

        if project is None:
            return False

        updatedProjects = [
            item for item in projects
            if item["id"] != str(idpID)
            or item["accountId"] != str(designerID)
        ]

        writeCSV(updatedProjects)

        return True


class SearchCurrentIDPController:

    def searchCurrentIDP(self, designerID, query) -> list:
        query = query.strip().lower()

        if not query:
            return []

        projects = readCSV()
        results = []

        for project in projects:
            if (
                project["accountId"] == str(designerID)
                and project["status"] == "Current"
            ):
                searchableFields = [
                    project["projectName"],
                    project["customerName"],
                    project["description"],
                    project["specifications"]
                ]

                if any(query in field.lower() for field in searchableFields):
                    results.append(createIDPObject(project))

        return results


# Past IDP Controllers (US25–29)

class CreatePastIDPController:

    def createPastIDP(self, designerID, name, description, completionDate) -> bool:
        name = name.strip()
        description = description.strip()
        completionDate = completionDate.strip()

        if not all([name, description, completionDate]):
            return False

        try:
            completedDate = date.fromisoformat(completionDate)
        except ValueError:
            return False

        if completedDate > date.today():
            return False

        projects = readCSV()

        for project in projects:
            if (
                project["accountId"] == str(designerID)
                and project["projectName"].lower() == name.lower()
            ):
                return False

        idpID = getNextIDPID(projects)

        idp = IDP(
            idpID,
            str(designerID),
            "",
            name,
            "",
            "",
            description,
            "",
            "100",
            completionDate,
            "Past",
            0,
            0
        )

        projects.append({
            "id": idp.idpID,
            "accountId": idp.designerID,
            "projectName": idp.projectName,
            "customerName": idp.customerName,
            "startDate": idp.startDate,
            "description": idp.description,
            "status": idp.status,
            "progress": str(idp.progress),
            "categoryId": idp.categoryID,
            "specifications": idp.specification,
            "progressNote": "",
            "completionDate": idp.completionDate,
            "images": ""
        })

        writeCSV(projects)

        return True


class ViewPastIDPController:

    def viewPastIDP(self, designerID, idpID) -> IDP:
        projects = readCSV()

        project = findPastIDP(projects, designerID, idpID)

        if project is None:
            return None

        return createIDPObject(project)


class UpdatePastIDPController:

    def updatePastIDP(self, designerID, idpID, name, description, completionDate) -> bool:
        name = name.strip()
        description = description.strip()
        completionDate = completionDate.strip()

        if not all([name, description, completionDate]):
            return False

        try:
            completedDate = date.fromisoformat(completionDate)
        except ValueError:
            return False

        if completedDate > date.today():
            return False

        projects = readCSV()

        project = findPastIDP(projects, designerID, idpID)

        if project is None:
            return False

        for otherProject in projects:
            if (
                otherProject["accountId"] == str(designerID)
                and otherProject["id"] != str(idpID)
                and otherProject["projectName"].lower() == name.lower()
            ):
                return False

        idp = createIDPObject(project)

        idp.projectName = name
        idp.description = description
        idp.completionDate = completionDate

        project["projectName"] = idp.projectName
        project["description"] = idp.description
        project["completionDate"] = idp.completionDate

        writeCSV(projects)

        return True


class DeletePastIDPController:

    def deletePastIDP(self, designerID, idpID) -> bool:
        projects = readCSV()

        project = findPastIDP(projects, designerID, idpID)

        if project is None:
            return False

        updatedProjects = [
            item for item in projects
            if not (
                item["id"] == str(idpID)
                and item["accountId"] == str(designerID)
            )
        ]

        writeCSV(updatedProjects)

        return True


class SearchPastIDPController:

    def searchPastIDP(self, designerID, query) -> list:
        query = query.strip().lower()

        if not query:
            return []

        projects = readCSV()
        results = []

        for project in projects:
            if (
                project["accountId"] == str(designerID)
                and project["status"] == "Past"
            ):
                searchableFields = [
                    project["projectName"],
                    project["customerName"],
                    project["description"],
                    project["specifications"]
                ]

                if any(query in field.lower() for field in searchableFields):
                    results.append(createIDPObject(project))

        return results
