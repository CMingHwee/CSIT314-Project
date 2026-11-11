from entity.UserAccount import UserAccount


class CreateUserAccountController:

    def createUserAccount(self, username, password, email, phone, role) -> bool:
        return UserAccount.createUserAccount(
            username, password, email, phone, role
        )


class ViewUserAccountController:

    def viewUserAccount(self, userAccountID) -> UserAccount:
        return UserAccount.viewUserAccount(userAccountID)


class UpdateUserAccountController:

    def updateUserAccount(self, username, password, email, phone, role) -> bool:
        return UserAccount.updateUserAccount(
            username, password, email, phone, role
        )


class SuspendUserAccountController:

    def suspendUserAccount(self, username) -> bool:
        return UserAccount.suspendUserAccount(username)


class SearchUserAccountController:

    def searchUserAccount(self, query) -> list:
        return UserAccount.searchUserAccount(query)
