
from control.AuthenticationController import (
    LoginController,
    UserAdminLoginController,
    LogoutController,
    UserAdminLogoutController
)


# US11, US18, US30, US39 - Login
class LoginBoundary:

    def __init__(self):
        self.controller = LoginController()

    def displayPage(self):
        return {
            "page": "Login",
            "fields": ["role", "email", "password"],
            "roles": [
                "Interior Designer",
                "Customer",
                "Platform Management"
            ]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to login."
            ),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Login successful."
            ),
            "result": result
        }


# US12 - User Admin Login
class UserAdminLoginBoundary:

    def __init__(self):
        self.controller = UserAdminLoginController()

    def displayPage(self):
        return {
            "page": "User Admin Login",
            "fields": ["username", "password"]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to login."
            ),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Login successful."
            ),
            "result": result
        }


# US19, US31, US40 - Logout
class LogoutBoundary:

    def __init__(self):
        self.controller = LogoutController()

    def displayPage(self):
        return {
            "page": "Logout",
            "confirmationRequired": True
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to logout."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Logout successful."
            ),
            "result": result
        }


# US19 - User Admin Logout
class UserAdminLogoutBoundary:

    def __init__(self):
        self.controller = UserAdminLogoutController()

    def displayPage(self):
        return {
            "page": "User Admin Logout",
            "confirmationRequired": False
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to logout."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Logout successful."
            ),
            "result": result
        }
