from control.UserAccountController import (
    CreateUserAccountController,
    ViewUserAccountController,
    UpdateUserAccountController,
    SuspendUserAccountController,
    SearchUserAccountController
)


# US1 - Create User Account
class CreateUserAccountBoundary:

    def __init__(self):
        self.controller = CreateUserAccountController()

    def displayPage(self):
        return {
            "title": "Create User Account",
            "fields": [
                "username",
                "password",
                "email",
                "phone",
                "role"
            ]
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fields": result.get("fields", {})
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "")
        }


# US2 - View User Account
class ViewUserAccountBoundary:

    def __init__(self):
        self.controller = ViewUserAccountController()

    def displayPage(self):
        return {
            "title": "View User Accounts"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "accounts": result.get("accounts", [])
        }


# US3 - Update User Account
class UpdateUserAccountBoundary:

    def __init__(self):
        self.controller = UpdateUserAccountController()

    def displayPage(self):
        return {
            "title": "Update User Account"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fields": result.get("fields", {})
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "")
        }


# US4 - Suspend User Account
class SuspendUserAccountBoundary:

    def __init__(self):
        self.controller = SuspendUserAccountController()

    def displayPage(self):
        return {
            "title": "Suspend User Account"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "message": result.get("message", "")
        }


# US5 - Search User Account
class SearchUserAccountBoundary:

    def __init__(self):
        self.controller = SearchUserAccountController()

    def displayPage(self):
        return {
            "title": "Search User Accounts"
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "accounts": result.get("accounts", [])
        }
