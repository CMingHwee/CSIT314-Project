from control.CompanyInfoController import (
    CreateCompanyInfoController,
    ViewCompanyInfoController,
    UpdateCompanyInfoController,
    DeleteCompanyInfoController,
    SearchCompanyInfoController
)


# US13 - Create Company Information
class CreateCompanyInfoBoundary:

    def __init__(self):
        self.controller = CreateCompanyInfoController()

    def displayPage(self):
        return {
            "title": "Create Company Information",
            "fields": [
                "companyName",
                "registrationNumber",
                "address",
                "contactEmail",
                "description"
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
            "message": result.get(
                "message",
                "Company Information Created Successfully"
            ),
            "company": result.get("company")
        }


# US14 - View Company Information
class ViewCompanyInfoBoundary:

    def __init__(self):
        self.controller = ViewCompanyInfoController()

    def displayPage(self):
        return {
            "title": "View Company Information",
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
            "company": result.get("company")
        }


# US15 - Update Company Information
class UpdateCompanyInfoBoundary:

    def __init__(self):
        self.controller = UpdateCompanyInfoController()

    def displayPage(self):
        return {
            "title": "Update Company Information",
            "fields": [
                "companyName",
                "registrationNumber",
                "address",
                "contactEmail",
                "description"
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
            "message": result.get(
                "message",
                "Company Information Updated Successfully"
            ),
            "company": result.get("company")
        }


# US16 - Delete Company Information
class DeleteCompanyInfoBoundary:

    def __init__(self):
        self.controller = DeleteCompanyInfoController()

    def displayPage(self):
        return {
            "title": "Delete Company Information",
            "confirmationMessage": (
                "Are you sure? This action cannot be undone."
            )
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get(
                "message",
                "Failed to delete company information. Please try again."
            )
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get(
                "message",
                "Company Information Deleted Successfully"
            )
        }


# US17 - Search Company Information
class SearchCompanyInfoBoundary:

    def __init__(self):
        self.controller = SearchCompanyInfoController()

    def displayPage(self):
        return {
            "title": "Search Company Information",
            "searchPlaceholder": "Enter a keyword to search your company information"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "matches": result.get("matches", []),
            "term": result.get("term", "")
        }
