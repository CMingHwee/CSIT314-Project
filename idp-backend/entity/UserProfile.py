class UserProfile:

    def __init__(self, profileID, userAccountID, firstName, lastName, address, companyName, status):
        self.__profileID: str = profileID
        self.__userAccountID: str = userAccountID
        self.__firstName: str = firstName
        self.__lastName: str = lastName
        self.__address: str = address
        self.__companyName: str = companyName
        self.__status: str = status

    # Profile ID
    @property
    def profileID(self):
        return self.__profileID

    # User Account ID
    @property
    def userAccountID(self):
        return self.__userAccountID

    # First Name
    @property
    def firstName(self):
        return self.__firstName

    @firstName.setter
    def firstName(self, firstName):
        self.__firstName = firstName

    # Last Name
    @property
    def lastName(self):
        return self.__lastName

    @lastName.setter
    def lastName(self, lastName):
        self.__lastName = lastName

    # Address
    @property
    def address(self):
        return self.__address

    @address.setter
    def address(self, address):
        self.__address = address

    # Company Name
    @property
    def companyName(self):
        return self.__companyName

    @companyName.setter
    def companyName(self, companyName):
        self.__companyName = companyName

    # Status
    @property
    def status(self):
        return self.__status

    @status.setter
    def status(self, status):
        self.__status = status