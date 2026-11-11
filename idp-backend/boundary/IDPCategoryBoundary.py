from control.IDPCategoryController import (
    CreateCategoryController,
    ViewCategoriesController,
    UpdateCategoryController,
    DeleteCategoryController,
    SearchCategoryController
)


# US41 - Create IDP Category
class CreateCategoryBoundary:

    def __init__(self):
        self.controller = CreateCategoryController()

    def displayPage(self):
        return {
            "page": "Create IDP Category",
            "fields": ["name", "description"]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to create category."
            ),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Category created successfully."
            ),
            "category": result.get("category")
        }


# US42 - View IDP Categories
class ViewCategoriesBoundary:

    def __init__(self):
        self.controller = ViewCategoriesController()

    def displayPage(self):
        return {
            "page": "View IDP Categories"
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to retrieve categories."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Categories retrieved successfully."
            ),
            "rows": result.get("rows", [])
        }


# US43 - Update IDP Category
class UpdateCategoryBoundary:

    def __init__(self):
        self.controller = UpdateCategoryController()

    def displayPage(self):
        return {
            "page": "Update IDP Category",
            "fields": ["categoryID", "name", "description"]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to update category."
            ),
            "fieldErrors": result.get("fieldErrors", {})
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Category updated successfully."
            ),
            "category": result.get("category")
        }


# US44 - Delete IDP Category
class DeleteCategoryBoundary:

    def __init__(self):
        self.controller = DeleteCategoryController()

    def displayPage(self):
        return {
            "page": "Delete IDP Category",
            "confirmationRequired": True
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to delete category."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Category deleted successfully."
            )
        }


# US45 - Search IDP Categories
class SearchCategoryBoundary:

    def __init__(self):
        self.controller = SearchCategoryController()

    def displayPage(self):
        return {
            "page": "Search IDP Categories",
            "fields": ["term"]
        }

    def displayError(self, result):
        return {
            "message": result.get(
                "message",
                "Unable to search categories."
            )
        }

    def displaySuccess(self, result):
        return {
            "message": result.get(
                "message",
                "Categories retrieved successfully."
            ),
            "rows": result.get("rows", []),
            "term": result.get("term", "")
        }
