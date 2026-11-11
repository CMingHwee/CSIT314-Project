class Session:

    def __init__(self, sessionID, userAccountID, startTime, status):
        self.__sessionID: str = sessionID
        self.__userAccountID: str = userAccountID
        self.__startTime: str = startTime
        self.__status: str = status

    # Session ID
    @property
    def sessionID(self):
        return self.__sessionID

    # User Account ID
    @property
    def userAccountID(self):
        return self.__userAccountID

    # Start Time
    @property
    def startTime(self):
        return self.__startTime

    # Status
    @property
    def status(self):
        return self.__status