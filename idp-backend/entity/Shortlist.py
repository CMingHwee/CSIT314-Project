class Shortlist:

    def __init__(self, shortlistID, customerID, idpID):
        self.__shortlistID: str = shortlistID
        self.__customerID: str = customerID
        self.__idpID: str = idpID

    # Shortlist ID
    @property
    def shortlistID(self):
        return self.__shortlistID

    # Customer ID
    @property
    def customerID(self):
        return self.__customerID

    # IDP ID
    @property
    def idpID(self):
        return self.__idpID
