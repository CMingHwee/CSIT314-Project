class UserAccount:

    def __init__(self, userAccountID, username, password, email, phone, role, status, sessionID):
        self.__userAccountID: str = userAccountID
        self.__username: str = username
        self.__password: str = password  # Stores hashed password
        self.__email: str = email
        self.__phone: str = phone
        self.__role: str = role # role can be "Admin", "Customer", "Platform Manager Staff" or "Interior Designer"
        self.__status: str = status
        self.__sessionID: str = sessionID

    # Account ID
    @property
    def userAccountID(self):
        return self.__userAccountID

    # Username
    @property
    def username(self):
        return self.__username

    @username.setter
    def username(self, username):
        self.__username = username

    # Password
    @property
    def password(self):
        return self.__password

    @password.setter
    def password(self, password):
        self.__password = password

    # Email
    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, email):
        self.__email = email

    # Phone
    @property
    def phone(self):
        return self.__phone

    @phone.setter
    def phone(self, phone):
        self.__phone = phone

    # Role
    @property
    def role(self):
        return self.__role

    # Status
    @property
    def status(self):
        return self.__status

    # Session ID
    @property
    def sessionID(self):
        return self.__sessionID