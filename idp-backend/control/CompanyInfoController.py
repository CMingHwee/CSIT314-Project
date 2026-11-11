import csv
import re
from pathlib import Path

from entity.CompanyInfo import CompanyInfo


BASE_PATH = Path(__file__).resolve().parents[2]
COMPANY_FILE = BASE_PATH / "idp-frontend" / "data" / "companies.csv"

FIELDNAMES = [
    "id",
    "accountId",
    "companyName",
    "registrationNumber",
    "address",
    "contactEmail",
    "description"
]


def readCSV():
    with open(COMPANY_FILE, "r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def writeCSV(rows):
    with open(COMPANY_FILE, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


def createCompanyObject(row):
    return CompanyInfo(
        row["id"],
        row["accountId"],
        row["companyName"],
        row["registrationNumber"],
        row["address"],
        row["contactEmail"],
        row["description"]
    )


def getNextCompanyID(companies):
    if not companies:
        return "1"

    return str(max(int(company["id"]) for company in companies) + 1)


def isValidCompanyInfo(companyName, regNumber, address, contactEmail, description):
    if not all([
        companyName.strip(),
        regNumber.strip(),
        address.strip(),
        contactEmail.strip(),
        description.strip()
    ]):
        return False

    if not re.fullmatch(r"[A-Za-z0-9]+", regNumber):
        return False

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", contactEmail):
        return False

    return True


class CreateCompanyInfoController:

    def createCompanyInfo(self, designerID, companyName, regNumber, address, contactEmail, description) -> bool:
        designerID = str(designerID)

        companyName = companyName.strip()
        regNumber = regNumber.strip().upper()
        address = address.strip()
        contactEmail = contactEmail.strip()
        description = description.strip()

        if not isValidCompanyInfo(companyName, regNumber, address, contactEmail, description):
            return False

        companies = readCSV()

        for company in companies:
            if company["accountId"] == designerID:
                return False

            if company["registrationNumber"].upper() == regNumber:
                return False

        companyID = getNextCompanyID(companies)

        companyInfo = CompanyInfo(
            companyID,
            designerID,
            companyName,
            regNumber,
            address,
            contactEmail,
            description
        )

        companies.append({
            "id": companyInfo.companyID,
            "accountId": companyInfo.designerID,
            "companyName": companyInfo.companyName,
            "registrationNumber": companyInfo.regNumber,
            "address": companyInfo.address,
            "contactEmail": companyInfo.contactEmail,
            "description": companyInfo.description
        })

        writeCSV(companies)

        return True


class ViewCompanyInfoController:

    def viewCompanyInfo(self, designerID) -> CompanyInfo:
        companies = readCSV()

        for company in companies:
            if company["accountId"] == str(designerID):
                return createCompanyObject(company)

        return None


class UpdateCompanyInfoController:

    def updateCompanyInfo(self, designerID, companyName, regNumber, address, contactEmail, description) -> bool:
        designerID = str(designerID)

        companyName = companyName.strip()
        regNumber = regNumber.strip().upper()
        address = address.strip()
        contactEmail = contactEmail.strip()
        description = description.strip()

        if not isValidCompanyInfo(companyName, regNumber, address, contactEmail, description):
            return False

        companies = readCSV()

        for company in companies:
            if company["accountId"] == designerID:

                for otherCompany in companies:
                    if (
                        otherCompany["registrationNumber"].upper() == regNumber
                        and otherCompany["id"] != company["id"]
                    ):
                        return False

                companyInfo = createCompanyObject(company)

                companyInfo.companyName = companyName
                companyInfo.regNumber = regNumber
                companyInfo.address = address
                companyInfo.contactEmail = contactEmail
                companyInfo.description = description

                company["companyName"] = companyInfo.companyName
                company["registrationNumber"] = companyInfo.regNumber
                company["address"] = companyInfo.address
                company["contactEmail"] = companyInfo.contactEmail
                company["description"] = companyInfo.description

                writeCSV(companies)

                return True

        return False


class DeleteCompanyInfoController:

    def deleteCompanyInfo(self, designerID) -> bool:
        companies = readCSV()

        updatedCompanies = [
            company for company in companies
            if company["accountId"] != str(designerID)
        ]

        if len(updatedCompanies) == len(companies):
            return False

        writeCSV(updatedCompanies)

        return True


class SearchCompanyInfoController:

    def searchCompanyInfo(self, designerID, query) -> list:
        query = query.strip().lower()

        if not query:
            return []

        companies = readCSV()
        results = []

        for company in companies:
            if company["accountId"] != str(designerID):
                continue

            fields = [
                "companyName",
                "registrationNumber",
                "address",
                "contactEmail",
                "description"
            ]

            for field in fields:
                if query in company[field].lower():
                    results.append(field)

        return results
