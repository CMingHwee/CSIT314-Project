class Report:

    def __init__(self, reportID, reportType, dateGenerated, trafficData, modificationLogs, employeePerformance):
        self.__reportID: str = reportID
        self.__reportType: str = reportType
        self.__dateGenerated: str = dateGenerated
        self.__trafficData: list = trafficData
        self.__modificationLogs: list = modificationLogs
        self.__employeePerformance: list = employeePerformance

    # Report ID
    @property
    def reportID(self):
        return self.__reportID

    # Report Type
    @property
    def reportType(self):
        return self.__reportType

    # Date Generated
    @property
    def dateGenerated(self):
        return self.__dateGenerated

    # Traffic Data
    @property
    def trafficData(self):
        return self.__trafficData

    # Modification Logs
    @property
    def modificationLogs(self):
        return self.__modificationLogs

    # Employee Performance
    @property
    def employeePerformance(self):
        return self.__employeePerformance