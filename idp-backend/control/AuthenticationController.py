
import csv
import secrets
from datetime import datetime

from entity.UserAccount import UserAccount
from entity.Session import Session

from pathlib import Path


BASE_PATH = Path(__file__).resolve().parents[2]
ACCOUNT_FILE = BASE_PATH / "idp-frontend" / "data" / "user_accounts.csv"

SESSION_TIMEOUT = 30 * 60

DASHBOARDS = {
    "Interior Designer": "designer-dashboard.html",
    "Customer": "browse-projects.html",
    "Platform Management": "pm-dashboard.html"
}

ADMIN_DASHBOARD = "admin-dashboard.html"
LOGIN_PAGE = "login.html"
ADMIN_LOGIN_PAGE = "admin-login.html"

# Active sessions maintained by the backend.
activeSessions = {}


def readCSV(filePath):
    if not filePath.exists():
        return []

    with open(filePath, "r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def createUserAccountObject(account):
    return UserAccount(
        account["id"],
        account["username"],
        account["password"],
        account["email"],
        account["phone"],
        account["role"],
        account["status"],
        None
    )


def createSession(account):
    sessionID = secrets.token_urlsafe(32)
    startTime = datetime.now().astimezone().isoformat()

    session = Session(
        sessionID,
        account.userAccountID,
        startTime,
        "Active"
    )

    activeSessions[sessionID] = session

    return session


def getActiveSession(sessionID):
    session = activeSessions.get(sessionID)

    if session is None:
        return None

    startTime = datetime.fromisoformat(session.startTime)
    currentTime = datetime.now().astimezone()

    elapsedTime = (currentTime - startTime).total_seconds()

    if elapsedTime > SESSION_TIMEOUT:
        del activeSessions[sessionID]
        return None

    return session


def createLoginResult(account, session, dashboard):
    return {
        "success": True,
        "message": "Login successful",
        "account": {
            "userAccountID": account.userAccountID,
            "username": account.username,
            "email": account.email,
            "role": account.role
        },
        "session": {
            "sessionID": session.sessionID,
            "userAccountID": session.userAccountID,
            "startTime": session.startTime,
            "status": session.status
        },
        "dashboard": dashboard
    }


class LoginController:

    def login(self, role, email, password):

        role = str(role or "").strip()
        email = str(email or "").strip()
        password = str(password or "")

        if not role or not email or not password:
            return {
                "success": False,
                "message": "Please complete all required fields."
            }

        if role not in DASHBOARDS:
            return {
                "success": False,
                "message": "Invalid credentials."
            }

        accounts = readCSV(ACCOUNT_FILE)

        accountData = next(
            (
                account for account in accounts
                if account["email"].lower() == email.lower()
            ),
            None
        )

        if (
            accountData is None
            or accountData["password"] != password
            or accountData["role"] != role
        ):
            return {
                "success": False,
                "message": "Invalid credentials."
            }

        if accountData["status"] != "Active":
            return {
                "success": False,
                "message": "Your account has been suspended."
            }

        account = createUserAccountObject(accountData)
        session = createSession(account)

        return createLoginResult(
            account,
            session,
            DASHBOARDS[role]
        )


class UserAdminLoginController:

    def login(self, username, password):

        username = str(username or "").strip()
        password = str(password or "")

        if not username or not password:
            return {
                "success": False,
                "message": "Please enter your username and password."
            }

        accounts = readCSV(ACCOUNT_FILE)

        accountData = next(
            (
                account for account in accounts
                if account["username"].lower() == username.lower()
            ),
            None
        )

        if (
            accountData is None
            or accountData["role"] != "User Admin"
            or accountData["password"] != password
        ):
            return {
                "success": False,
                "message": "Invalid username or password."
            }

        if accountData["status"] != "Active":
            return {
                "success": False,
                "message": "Your account has been suspended."
            }

        account = createUserAccountObject(accountData)
        session = createSession(account)

        return createLoginResult(
            account,
            session,
            ADMIN_DASHBOARD
        )


class LogoutController:

    def logout(self, sessionID):

        session = getActiveSession(sessionID)

        if session is None:
            return {
                "success": False,
                "message": "Logout failed. Please try again."
            }

        del activeSessions[sessionID]

        return {
            "success": True,
            "message": "You have been logged out.",
            "redirect": LOGIN_PAGE
        }


class UserAdminLogoutController:

    def logout(self, sessionID):

        session = getActiveSession(sessionID)

        if session is None:
            return {
                "success": False,
                "message": "Logout failed. Please try again."
            }

        del activeSessions[sessionID]

        return {
            "success": True,
            "message": "You have been logged out.",
            "redirect": ADMIN_LOGIN_PAGE
        }
