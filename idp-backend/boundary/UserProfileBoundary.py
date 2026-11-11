from control.UserProfileController import (
    CreateUserProfileController,
    ViewUserProfileController,
    UpdateUserProfileController,
    SuspendUserProfileController,
    SearchUserProfileController
)


# US6 - Create User Profile
class CreateUserProfileBoundary:

    def __init__(self):
        self.controller = CreateUserProfileController()

    def displayPage(self):
        accounts = self.controller.getAccountsWithoutProfile()

        return {
            "title": "Create User Profile",
            "fields": [
                "accountId",
                "firstName",
                "lastName",
                "address",
                "companyName"
            ],
            "accounts": accounts
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fields": result.get("fields", {})
        }

    def displaySuccess(self, result):
        profile = result["profile"]
        account = result["account"]

        return {
            "type": "success",
            "message": result.get("message", ""),
            "profile": profile,
            "username": account.username
        }


# US7 - View User Profile
class ViewUserProfileBoundary:

    def __init__(self):
        self.controller = ViewUserProfileController()

    def displayPage(self):
        result = self.controller.getUserProfiles()

        if not result.get("success"):
            return self.displayError(result)

        return self.displaySuccess(result)

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "No profiles found."),
            "profiles": []
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "profiles": result.get("rows", [])
        }


# US8 - Update User Profile
class UpdateUserProfileBoundary:

    def __init__(self):
        self.controller = UpdateUserProfileController()

    def displayPage(self, profileID):
        result = self.controller.getUserProfile(profileID)

        if not result.get("success"):
            return self.displayError(result)

        return self.displaySuccess(result)

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fields": result.get("fields", {})
        }

    def displaySuccess(self, result):
        profile = result["profile"]

        return {
            "type": "success",
            "message": result.get("message", ""),
            "profile": profile
        }


# US9 - Suspend User Profile
class SuspendUserProfileBoundary:

    def __init__(self):
        self.controller = SuspendUserProfileController()

    def displayPage(self, profileID):
        result = self.controller.getUserProfile(profileID)

        if not result.get("success"):
            return self.displayError(result)

        return self.displaySuccess(result)

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", "")
        }

    def displaySuccess(self, result):
        profile = result["profile"]

        return {
            "type": "success",
            "profile": profile,
            "status": profile.status
        }


# US10 - Search User Profiles
class SearchUserProfileBoundary:

    def __init__(self):
        self.controller = SearchUserProfileController()

    def displayPage(self):
        return {
            "title": "Search User Profiles",
            "searchOptions": [
                {"value": "company", "label": "Company Name"},
                {"value": "location", "label": "Location"}
            ]
        }

    def displayError(self, result):
        return {
            "type": "error",
            "message": result.get("message", ""),
            "fields": result.get("fields", {}),
            "profiles": []
        }

    def displaySuccess(self, result):
        return {
            "type": "success",
            "profiles": result.get("rows", []),
            "searchTerm": result.get("term", ""),
            "searchBy": result.get("by", "company")
        }
