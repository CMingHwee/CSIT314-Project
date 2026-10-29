class User:

    # Global Variable
    def __init__(self, username, password, email, phone, role, suspend_acc):
        self.__username: str = username
        self.__password: str = password
        self.__email: str = email
        self.__phone: int = phone
        self.__role: str = role
        self.suspend_acc = False


    # Username Getter & Setter
    @property
    def username(self):
        return self.__username

    @username.setter
    def username(self, username):
        if not username:
            raise ValueError("Username cannot be empty")
        self.__username = username

    # Password Getter & Setter
    @property
    def password(self):
        return self.__password

    @password.setter
    def password(self, password):
        if not password:
            raise ValueError("Password cannot be empty")
        self.__password = password

    # Email Getter & Setter
    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, email):
        if not email:
            raise ValueError("Email cannot be empty")
        self.__email = email

    # Phone Getter & Setter
    @property
    def phone(self):
        return self.__phone

    @phone.setter
    def phone(self, phone):
        if not phone:
            raise ValueError("Phone cannot be empty")
        self.__phone = phone

    # Role Getter & Setter
    @property
    def role(self):
        return self.__role

    @role.setter
    def role(self, role):
        if not role:
            raise ValueError("Role cannot be empty")
        self.__role = role