class IDPCategory:

    def __init__(self, categoryID, categoryName, description):
        self.__categoryID: str = categoryID
        self.__categoryName: str = categoryName
        self.__description: str = description

    # Category ID
    @property
    def categoryID(self):
        return self.__categoryID

    # Category Name
    @property
    def categoryName(self):
        return self.__categoryName

    @categoryName.setter
    def categoryName(self, categoryName):
        self.__categoryName = categoryName

    # Description
    @property
    def description(self):
        return self.__description

    @description.setter
    def description(self, description):
        self.__description = description
