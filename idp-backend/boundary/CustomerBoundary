from control.CustomerController import (
    SearchIDPController,
    ViewIDPController,
    SaveIDPController,
    SearchShortlistController,
    ViewShortlistController
)


# US32 - Search Interior Designer Projects
class SearchIDPBoundary:

    def __init__(self):
        self.controller = SearchIDPController()

    def displayPage(self):
        return {
            "page": "Search Interior Designer Projects",
            "fields": ["searchTerm", "categoryID"]
        }

    def displayError(self, result):
        return {
            "message": result.get("message", "Unable to search projects."),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "message": result.get("message", "Projects retrieved successfully."),
            "rows": result.get("rows", [])
        }


# US33 - View Interior Designer Project
class ViewIDPBoundary:

    def __init__(self):
        self.controller = ViewIDPController()

    def displayPage(self):
        return {
            "page": "View Interior Designer Project",
            "fields": ["idpID"]
        }

    def displayError(self, result):
        return {
            "message": result.get("message", "Unable to view project.")
        }

    def displaySuccess(self, result):
        return {
            "message": result.get("message", "Project retrieved successfully."),
            "idp": result.get("idp")
        }


# US34 - Save Interior Designer Project
class SaveIDPBoundary:

    def __init__(self):
        self.controller = SaveIDPController()

    def displayPage(self):
        return {
            "page": "Save Interior Designer Project",
            "fields": ["customerID", "idpID"]
        }

    def displayError(self, result):
        return {
            "message": result.get("message", "Unable to save project.")
        }

    def displaySuccess(self, result):
        return {
            "message": result.get("message", "Project saved successfully."),
            "shortlist": result.get("shortlist")
        }


# US35 - Search Saved Projects
class SearchShortlistBoundary:

    def __init__(self):
        self.controller = SearchShortlistController()

    def displayPage(self):
        return {
            "page": "Search Saved Projects",
            "fields": ["searchTerm"]
        }

    def displayError(self, result):
        return {
            "message": result.get("message", "Unable to search saved projects.")
        }

    def displaySuccess(self, result):
        return {
            "message": result.get("message", "Saved projects retrieved successfully."),
            "rows": result.get("rows", [])
        }


# US36 - View Saved Projects
class ViewShortlistBoundary:

    def __init__(self):
        self.controller = ViewShortlistController()

    def displayPage(self):
        return {
            "page": "View Saved Projects"
        }

    def displayError(self, result):
        return {
            "message": result.get("message", "Unable to view saved projects.")
        }

    def displaySuccess(self, result):
        return {
            "message": result.get("message", "Saved projects retrieved successfully."),
            "rows": result.get("rows", [])
        }
