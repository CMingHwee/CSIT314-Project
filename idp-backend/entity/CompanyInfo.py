class CompanyInfo:

    def __init__(self, companyID, designerID, companyName, regNumber, address, contactEmail, description):
        self.__companyID: str = companyID
        self.__designerID: str = designerID
        self.__companyName: str = companyName
        self.__regNumber: str = regNumber
        self.__address: str = address
        self.__contactEmail: str = contactEmail
        self.__description: str = description

    # Company ID
    @property
    def companyID(self):
        return self.__companyID

    # Designer ID
    @property
    def designerID(self):
        return self.__designerID

    # Company Name
    @property
    def companyName(self):
        return self.__companyName

    @companyName.setter
    def companyName(self, companyName):
        self.__companyName = companyName

    # Registration Number
    @property
    def regNumber(self):
        return self.__regNumber

    @regNumber.setter
    def regNumber(self, regNumber):
        self.__regNumber = regNumber

    # Address
    @property
    def address(self):
        return self.__address

    @address.setter
    def address(self, address):
        self.__address = address

    # Contact Email
    @property
    def contactEmail(self):
        return self.__contactEmail

    @contactEmail.setter
    def contactEmail(self, contactEmail):
        self.__contactEmail = contactEmail

    # Description
    @property
    def description(self):
        return self.__description

    @description.setter
    def description(self, description):
        self.__description = description