import csv
from pathlib import Path

from entity.IDPCategory import IDPCategory


BASE_PATH = Path(__file__).resolve().parents[2]

CATEGORY_FILE = BASE_PATH / "idp-frontend" / "data" / "categories.csv"
PROJECT_FILE = BASE_PATH / "idp-frontend" / "data" / "projects.csv"

CATEGORY_FIELDNAMES = ["id", "name", "description"]


def readCSV(file):
    with open(file, "r", newline="", encoding="utf-8-sig") as csvFile:
        return list(csv.DictReader(csvFile))


def writeCSV(file, rows, fieldnames):
    with open(file, "w", newline="", encoding="utf-8") as csvFile:
        writer = csv.DictWriter(csvFile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def createCategoryObject(row):
    return IDPCategory(
        row["id"],
        row["name"],
        row["description"]
    )


def getNextCategoryID(categories):
    if len(categories) == 0:
        return "1"

    return str(max(int(category["id"]) for category in categories) + 1)


def getCategoryProjectCount(categoryID, projects):
    return sum(
        1 for project in projects
        if project["categoryId"] == str(categoryID)
    )


class CreateCategoryController:

    def createCategory(self, name, description):

        name = str(name or "").strip()
        description = str(description or "").strip()

        if name == "" or description == "":
            return {
                "success": False,
                "message": "Please fill in all required fields.",
                "fieldErrors": {
                    "name": "Required." if name == "" else "",
                    "description": "Required." if description == "" else ""
                }
            }

        categories = readCSV(CATEGORY_FILE)

        for category in categories:
            if category["name"].strip().lower() == name.lower():
                return {
                    "success": False,
                    "message": "Category with this name already exists.",
                    "fieldErrors": {
                        "name": "Category with this name already exists."
                    }
                }

        categoryID = getNextCategoryID(categories)

        newCategory = {
            "id": categoryID,
            "name": name,
            "description": description
        }

        categories.append(newCategory)

        writeCSV(CATEGORY_FILE, categories, CATEGORY_FIELDNAMES)

        return {
            "success": True,
            "message": "Category Created Successfully",
            "category": createCategoryObject(newCategory)
        }


class ViewCategoriesController:

    def getCategories(self):

        categories = readCSV(CATEGORY_FILE)
        projects = readCSV(PROJECT_FILE)

        rows = []

        for category in categories:
            categoryObject = createCategoryObject(category)

            rows.append({
                "category": categoryObject,
                "projects": getCategoryProjectCount(
                    category["id"],
                    projects
                )
            })

        if len(rows) == 0:
            return {
                "success": False,
                "message": "No categories found. Please create one.",
                "rows": []
            }

        return {
            "success": True,
            "message": "",
            "rows": rows
        }


class UpdateCategoryController:

    def getCategory(self, categoryID):

        categories = readCSV(CATEGORY_FILE)
        projects = readCSV(PROJECT_FILE)

        for category in categories:
            if category["id"] == str(categoryID):

                return {
                    "success": True,
                    "message": "",
                    "category": createCategoryObject(category),
                    "projects": getCategoryProjectCount(
                        categoryID,
                        projects
                    )
                }

        return {
            "success": False,
            "message": "Category not found. Choose one from IDP Categories."
        }

    def updateCategory(self, categoryID, name, description):

        name = str(name or "").strip()
        description = str(description or "").strip()

        categories = readCSV(CATEGORY_FILE)

        selectedCategory = None

        for category in categories:
            if category["id"] == str(categoryID):
                selectedCategory = category
                break

        if selectedCategory is None:
            return {
                "success": False,
                "message": "Category not found. Choose one from IDP Categories."
            }

        if name == "" or description == "":
            return {
                "success": False,
                "message": "Please fill in all required fields.",
                "fieldErrors": {
                    "name": "Required." if name == "" else "",
                    "description": "Required." if description == "" else ""
                }
            }

        for category in categories:
            if (
                category["id"] != str(categoryID)
                and category["name"].strip().lower() == name.lower()
            ):
                return {
                    "success": False,
                    "message": "Category with this name already exists.",
                    "fieldErrors": {
                        "name": "Category with this name already exists."
                    }
                }

        selectedCategory["name"] = name
        selectedCategory["description"] = description

        writeCSV(CATEGORY_FILE, categories, CATEGORY_FIELDNAMES)

        return {
            "success": True,
            "message": "Category Updated Successfully",
            "category": createCategoryObject(selectedCategory)
        }


class DeleteCategoryController:

    def canDelete(self, categoryID):

        categories = readCSV(CATEGORY_FILE)
        projects = readCSV(PROJECT_FILE)

        for category in categories:
            if category["id"] == str(categoryID):

                categoryObject = createCategoryObject(category)

                if getCategoryProjectCount(categoryID, projects) > 0:
                    return {
                        "success": False,
                        "message": "Cannot delete category. It is currently assigned to existing IDPs.",
                        "category": categoryObject
                    }

                return {
                    "success": True,
                    "message": "",
                    "category": categoryObject
                }

        return {
            "success": False,
            "message": "Category not found."
        }

    def deleteCategory(self, categoryID):

        result = self.canDelete(categoryID)

        if not result["success"]:
            return result

        categories = readCSV(CATEGORY_FILE)

        categories = [
            category for category in categories
            if category["id"] != str(categoryID)
        ]

        writeCSV(CATEGORY_FILE, categories, CATEGORY_FIELDNAMES)

        return {
            "success": True,
            "message": "Category Deleted Successfully",
            "category": result["category"]
        }


class SearchCategoryController:

    def searchCategories(self, term):

        term = str(term or "").strip()

        if term == "":
            return {
                "success": False,
                "message": "Please enter a search term.",
                "fieldErrors": {
                    "term": "Please enter a search term."
                }
            }

        categories = readCSV(CATEGORY_FILE)
        projects = readCSV(PROJECT_FILE)

        rows = []

        for category in categories:

            if term.lower() in category["name"].strip().lower():

                rows.append({
                    "category": createCategoryObject(category),
                    "projects": getCategoryProjectCount(
                        category["id"],
                        projects
                    )
                })

        if len(rows) == 0:
            return {
                "success": False,
                "message": "No categories found matching your query.",
                "rows": [],
                "term": term
            }

        return {
            "success": True,
            "message": "",
            "rows": rows,
            "term": term
        }
