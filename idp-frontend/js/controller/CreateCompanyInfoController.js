/*
 * Create Company Information
 * CreateCompanyInfoPage → CreateCompanyInfoController.createCompanyInfo(...) → CompanyInfo
 */
class CreateCompanyInfoController {
  // A designer can only have one company record.
  hasCompanyInfo(accountId) {
    return CompanyInfo.findByAccountId(accountId) !== null;
  }

  createCompanyInfo(accountId, companyName, registrationNumber, address, contactEmail, description) {
    companyName = String(companyName ?? '').trim();
    registrationNumber = String(registrationNumber ?? '').trim().toUpperCase();
    address = String(address ?? '').trim();
    contactEmail = String(contactEmail ?? '').trim();
    description = String(description ?? '').trim();

    if (this.hasCompanyInfo(accountId)) {
      return Result.fail('You already have company information. Edit it instead.');
    }

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

    // Alternate flow: registration number already used
    if (CompanyInfo.isRegistrationNumberTaken(registrationNumber)) {
      return Result.fieldError('registrationNumber', 'Company with this registration number already exists.');
    }

    const company = new CompanyInfo({
      accountId, companyName, registrationNumber, address, contactEmail, description
    }).save();

    ActivityLog.record('Interior Designer', 'Created company info', companyName);
    return Result.ok('Company Information Created Successfully', { company });
  }
}
