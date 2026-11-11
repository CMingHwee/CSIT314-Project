import csv
from pathlib import Path

from entity.UserProfile import UserProfile
from entity.UserAccount import UserAccount


BASE_PATH = Path(__file__).resolve().parents[2]
PROFILE_FILE = BASE_PATH / "idp-frontend" / "data" / "user_profiles.csv"
ACCOUNT_FILE = BASE_PATH / "idp-frontend" / "data" / "user_accounts.csv"


def readCSV(filePath):
    with open(filePath, "r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def writeCSV(filePath, rows):
    if not rows:
        return

    with open(filePath, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def getUserAccount(userAccountID):
    accounts = readCSV(ACCOUNT_FILE)

    for account in accounts:
        if account["id"] == str(userAccountID):
            return UserAccount(
                account["id"],
                account["username"],
                account["password"],
                account["email"],
                account["phone"],
                account["role"],
                account["status"],
                ""
            )

    return None


def getNextProfileID(profiles):
    if not profiles:
        return "1"

    return str(max(int(profile["id"]) for profile in profiles) + 1)


def createProfileObject(row):
    return UserProfile(
        row["id"],
        row["accountId"],
        row["firstName"],
        row["lastName"],
        row["address"],
        row["companyName"],
        row["status"]
    )


class CreateUserProfileController:

    def createUserProfile(self, userAccountID, firstName, lastName, address, companyName) -> bool:
        userAccount = getUserAccount(userAccountID)

        if userAccount is None:
            return False

        if not firstName.strip() or not lastName.strip() or not address.strip():
            return False

        profiles = readCSV(PROFILE_FILE)

        for profile in profiles:
            if profile["accountId"] == userAccount.userAccountID:
                return False

        profileID = getNextProfileID(profiles)

        userProfile = UserProfile(
            profileID,
            userAccount.userAccountID,
            firstName.strip(),
            lastName.strip(),
            address.strip(),
            companyName.strip(),
            userAccount.status
        )

        profiles.append({
            "id": userProfile.profileID,
            "accountId": userProfile.userAccountID,
            "firstName": userProfile.firstName,
            "lastName": userProfile.lastName,
            "address": userProfile.address,
            "companyName": userProfile.companyName,
            "companyRegNo": "",
            "status": userProfile.status,
            "photo": ""
        })

        writeCSV(PROFILE_FILE, profiles)

        return True


class ViewUserProfileController:

    def viewUserProfile(self, userAccountID) -> UserProfile:
        profiles = readCSV(PROFILE_FILE)

        for profile in profiles:
            if profile["accountId"] == str(userAccountID):
                return createProfileObject(profile)

        return None


class EditUserProfileController:

    def editUserProfile(self, userAccountID, firstName, lastName, address, companyName) -> bool:
        if not firstName.strip() or not lastName.strip() or not address.strip():
            return False

        profiles = readCSV(PROFILE_FILE)

        for profile in profiles:
            if profile["accountId"] == str(userAccountID):
                userProfile = createProfileObject(profile)

                userProfile.firstName = firstName.strip()
                userProfile.lastName = lastName.strip()
                userProfile.address = address.strip()
                userProfile.companyName = companyName.strip()

                profile["firstName"] = userProfile.firstName
                profile["lastName"] = userProfile.lastName
                profile["address"] = userProfile.address
                profile["companyName"] = userProfile.companyName

                writeCSV(PROFILE_FILE, profiles)

                return True

        return False


class SuspendUserProfileController:

    def suspendUserProfile(self, userAccountID) -> bool:
        profiles = readCSV(PROFILE_FILE)

        for profile in profiles:
            if profile["accountId"] == str(userAccountID):
                if profile["status"] == "Suspended":
                    return False

                profile["status"] = "Suspended"
                writeCSV(PROFILE_FILE, profiles)

                return True

        return False


class SearchUserProfileController:

    def searchUserProfiles(self, companyName, location) -> list:
        companyName = companyName.strip().lower()
        location = location.strip().lower()

        if not companyName and not location:
            return []

        profiles = readCSV(PROFILE_FILE)
        results = []

        for profile in profiles:
            if profile["status"] == "Suspended":
                continue

            companyMatch = (
                companyName and
                companyName in profile["companyName"].lower()
            )

            locationMatch = (
                location and
                location in profile["address"].lower()
            )

            if companyMatch or locationMatch:
                results.append(createProfileObject(profile))

        return results
