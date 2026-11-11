from control.InteriorDesignerController import ViewIDPAnalyticsController


# US37 - View Interior Designer Project Analytics
# US38 - View Interior Designer Project Statistics
class ViewIDPAnalyticsBoundary:

    def __init__(self):
        self.controller = ViewIDPAnalyticsController()

    def displayPage(self):
        return {
            "page": "Interior Designer Project Analytics",
            "fields": ["sortBy"],
            "sortOptions": ["views", "shortlisted"]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to retrieve project analytics."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Project analytics retrieved successfully."
            ),
            "rows": result.get("rows", []),
            "sortBy": result.get("sortBy"),
            "totalViews": result.get("totalViews", 0),
            "totalShortlisted": result.get("totalShortlisted", 0),
            "projectCount": result.get("projectCount", 0)
        }
