from control.ReportController import (
    GenerateDailyReportController,
    GenerateWeeklyReportController,
    GenerateMonthlyReportController
)


# US46 - Generate Daily Report
class GenerateDailyReportBoundary:

    def __init__(self):
        self.controller = GenerateDailyReportController()

    def displayPage(self):
        return {
            "page": "Daily Report",
            "fields": ["dayKey"]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to generate daily report."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Daily report generated successfully."
            ),
            "report": result.get("report"),
            "rows": result.get("rows", [])
        }


# US47 - Generate Weekly Report
class GenerateWeeklyReportBoundary:

    def __init__(self):
        self.controller = GenerateWeeklyReportController()

    def displayPage(self):
        return {
            "page": "Weekly Report",
            "fields": ["endDayKey"]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to generate weekly report."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Weekly report generated successfully."
            ),
            "report": result.get("report"),
            "rows": result.get("rows", [])
        }


# US48 - Generate Monthly Report
class GenerateMonthlyReportBoundary:

    def __init__(self):
        self.controller = GenerateMonthlyReportController()

    def displayPage(self):
        return {
            "page": "Monthly Report",
            "fields": ["monthKey"]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to generate monthly report."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Monthly report generated successfully."
            ),
            "report": result.get("report"),
            "rows": result.get("rows", [])
        }
