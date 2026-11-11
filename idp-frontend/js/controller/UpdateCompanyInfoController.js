/*
 * Update Company Information
 * UpdateCompanyInfoPage → UpdateCompanyInfoController.updateCompanyInfo(...) → CompanyInfo
 */
class UpdateCompanyInfoController {
  getCompanyInfo(accountId) {
    const company = CompanyInfo.findByAccountId(accountId);
    if (!company) return Result.fail('No company information found. Please create a profile.');
    return Result.ok('', { company });
  }

  updateCompanyInfo(accountId, companyName, registrationNumber, address, contactEmail, description) {
    const company = CompanyInfo.findByAccountId(accountId);
    if (!company) return Result.fail('No company information found. Please create a profile.');

    companyName = String(companyName ?? '').trim();
    registrationNumber = String(registrationNumber ?? '').trim().toUpperCase();
    address = String(address ?? '').trim();
    contactEmail = String(contactEmail ?? '').trim();
    description = String(description ?? '').trim();

    const empty = Object.entries({ companyName, registrationNumber, address, contactEmail, description })
      .filter(([, v]) => Validation.isBlank(v))
      .map(([k]) => k);
    if (empty.length) return Result.missing(empty);

    if (!Validation.isRegistrationNumber(registrationNumber)) {
      return Result.fieldError('registrationNumber', 'Use letters and numbers only.');
    }
    if (!Validation.isEmail(contactEmail)) {
      return Result.fieldError('contactEmail', 'Please enter a valid email address.');
    }

    // Alternate flow: registration number belongs to another company
    if (CompanyInfo.isRegistrationNumberTaken(registrationNumber, company.getId())) {
      return Result.fieldError('registrationNumber', 'Company with this registration number already exists.');
    }

    company.setCompanyName(companyName);
    company.setRegistrationNumber(registrationNumber);
    company.setAddress(address);
    company.setContactEmail(contactEmail);
    company.setDescription(description);
    company.save();

    ActivityLog.record('Interior Designer', 'Updated company info', companyName);
    return Result.ok('Company Information Updated Successfully', { company });
  }
}
