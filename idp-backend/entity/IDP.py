class IDP:

    def __init__(self, idpID, designerID, categoryID, projectName, customerName, startDate, description, specification, progress, completionDate, status, viewCount, shortlistCount):
        self.__idpID: str = idpID
        self.__designerID: str = designerID
        self.__categoryID: str = categoryID
        self.__projectName: str = projectName
        self.__customerName: str = customerName
        self.__startDate: str = startDate
        self.__description: str = description
        self.__specification: str = specification
        self.__progress: str = progress
        self.__completionDate: str = completionDate
        self.__status: str = status
        self.__viewCount: int = viewCount
        self.__shortlistCount: int = shortlistCount

    # IDP ID
    @property
    def idpID(self):
        return self.__idpID

    # Designer ID
    @property
    def designerID(self):
        return self.__designerID

    # Category ID
    @property
    def categoryID(self):
        return self.__categoryID

    # Project Name
    @property
    def projectName(self):
        return self.__projectName

    @projectName.setter
    def projectName(self, projectName):
        self.__projectName = projectName

    # Customer Name
    @property
    def customerName(self):
        return self.__customerName

    @customerName.setter
    def customerName(self, customerName):
        self.__customerName = customerName

    # Start Date
    @property
    def startDate(self):
        return self.__startDate

    @startDate.setter
    def startDate(self, startDate):
        self.__startDate = startDate

    # Description
    @property
    def description(self):
        return self.__description

    @description.setter
    def description(self, description):
        self.__description = description

    # Specification
    @property
    def specification(self):
        return self.__specification

    @specification.setter
    def specification(self, specification):
        self.__specification = specification

    # Progress
    @property
    def progress(self):
        return self.__progress

    @progress.setter
    def progress(self, progress):
        self.__progress = progress

    # Completion Date
    @property
    def completionDate(self):
        return self.__completionDate

    @completionDate.setter
    def completionDate(self, completionDate):
        self.__completionDate = completionDate

    # Status
    @property
    def status(self):
        return self.__status

    @status.setter
    def status(self, status):
        self.__status = status

    # View Count
    @property
    def viewCount(self):
        return self.__viewCount

    # Shortlist Count
    @property
    def shortlistCount(self):
        return self.__shortlistCount