from control.IDPController import (
    CreateCurrentIDPController,
    ViewCurrentIDPController,
    UpdateCurrentIDPController,
    DeleteCurrentIDPController,
    SearchCurrentIDPController,
    CreatePastIDPController,
    ViewPastIDPController,
    UpdatePastIDPController,
    DeletePastIDPController,
    SearchPastIDPController
)


# US20 - Create Current IDP
class CreateCurrentIDPBoundary:

    def __init__(self):
        self.controller = CreateCurrentIDPController()

    def displayPage(self):
        return {
            "title": "Create Current IDP",
            "fields": [
                "projectName",
                "customerName",
                "categoryID",
                "startDate",
                "description",
                "specification",
                "progress",
                "completionDate",
                "status"
            ]
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "Current IDP Created Successfully"),
            "idp": result.get("idp")
        }


# US21 - View Current IDP
class ViewCurrentIDPBoundary:

    def __init__(self):
        self.controller = ViewCurrentIDPController()

    def displayPage(self):
        return {
            "title": "Current IDP",
            "readOnly": True
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "idp": result.get("idp"),
            "rows": result.get("rows", [])
        }


# US22 - Update Current IDP
class UpdateCurrentIDPBoundary:

    def __init__(self):
        self.controller = UpdateCurrentIDPController()

    def displayPage(self):
        return {
            "title": "Update Current IDP",
            "fields": [
                "projectName",
                "customerName",
                "categoryID",
                "startDate",
                "description",
                "specification",
                "progress",
                "completionDate",
                "status"
            ]
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "Current IDP Updated Successfully"),
            "idp": result.get("idp")
        }


# US23 - Delete Current IDP
class DeleteCurrentIDPBoundary:

    def __init__(self):
        self.controller = DeleteCurrentIDPController()

    def displayPage(self):
        return {
            "title": "Delete Current IDP",
            "confirmationMessage": "Are you sure you want to delete this project?"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "Current IDP Deleted Successfully")
        }


# US24 - Search Current IDP
class SearchCurrentIDPBoundary:

    def __init__(self):
        self.controller = SearchCurrentIDPController()

    def displayPage(self):
        return {
            "title": "Search Current IDP",
            "searchPlaceholder": "Search current projects"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "rows": result.get("rows", []),
            "term": result.get("term", "")
        }


# US25 - Create Past IDP
class CreatePastIDPBoundary:

    def __init__(self):
        self.controller = CreatePastIDPController()

    def displayPage(self):
        return {
            "title": "Create Past IDP",
            "fields": [
                "projectName",
                "customerName",
                "categoryID",
                "startDate",
                "description",
                "specification",
                "progress",
                "completionDate",
                "status"
            ]
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "Past IDP Created Successfully"),
            "idp": result.get("idp")
        }


# US26 - View Past IDP
class ViewPastIDPBoundary:

    def __init__(self):
        self.controller = ViewPastIDPController()

    def displayPage(self):
        return {
            "title": "Past IDP",
            "readOnly": True
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "idp": result.get("idp"),
            "rows": result.get("rows", [])
        }


# US27 - Update Past IDP
class UpdatePastIDPBoundary:

    def __init__(self):
        self.controller = UpdatePastIDPController()

    def displayPage(self):
        return {
            "title": "Update Past IDP",
            "fields": [
                "projectName",
                "customerName",
                "categoryID",
                "startDate",
                "description",
                "specification",
                "progress",
                "completionDate",
                "status"
            ]
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "Past IDP Updated Successfully"),
            "idp": result.get("idp")
        }


# US28 - Delete Past IDP
class DeletePastIDPBoundary:

    def __init__(self):
        self.controller = DeletePastIDPController()

    def displayPage(self):
        return {
            "title": "Delete Past IDP",
            "confirmationMessage": "Are you sure you want to delete this project?"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "Past IDP Deleted Successfully")
        }


# US29 - Search Past IDP
class SearchPastIDPBoundary:

    def __init__(self):
        self.controller = SearchPastIDPController()

    def displayPage(self):
        return {
            "title": "Search Past IDP",
            "searchPlaceholder": "Search past projects"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "rows": result.get("rows", []),
            "term": result.get("term", "")
        }
