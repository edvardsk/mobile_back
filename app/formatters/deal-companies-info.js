const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.DEAL_COMPANIES_INFO.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

const formatRecordToSaveFromOriginal = (id, company) => ({
    id,
    [cols.NAME]: company[colsCompanies.NAME],
    [cols.OWNERSHIP_TYPE]: company[colsCompanies.OWNERSHIP_TYPE],
    [cols.WEBSITE]: company[colsCompanies.WEBSITE],
    [cols.REGISTERED_AT]: (company[colsCompanies.REGISTERED_AT] && company[colsCompanies.REGISTERED_AT].toISOString()) || null,
    [cols.COUNTRY_ID]: company[colsCompanies.COUNTRY_ID],
    [cols.IDENTITY_NUMBER]: company[colsCompanies.IDENTITY_NUMBER],
    [cols.LEGAL_ADDRESS]: company[colsCompanies.LEGAL_ADDRESS],
    [cols.SETTLEMENT_ACCOUNT]: company[colsCompanies.SETTLEMENT_ACCOUNT],
    [cols.POST_ADDRESS]: company[colsCompanies.POST_ADDRESS],
    [cols.BANK_NAME]: company[colsCompanies.BANK_NAME],
    [cols.HEAD_COMPANY_FULL_NAME]: company[colsCompanies.HEAD_COMPANY_FULL_NAME],
    [cols.BANK_ADDRESS]: company[colsCompanies.BANK_ADDRESS],
    [cols.BANK_CODE]: company[colsCompanies.BANK_CODE],
    [cols.CONTRACT_SIGNER_FULL_NAME]: company[colsCompanies.CONTRACT_SIGNER_FULL_NAME],
    [cols.STATE_REGISTRATION_CERTIFICATE_NUMBER]: company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER],
    [cols.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: (company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT] && company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT].toISOString()) || null,
    [cols.INSURANCE_COMPANY_NAME]: company[colsCompanies.INSURANCE_COMPANY_NAME],
    [cols.INSURANCE_POLICY_CREATED_AT]: (company[colsCompanies.INSURANCE_POLICY_CREATED_AT] && company[colsCompanies.INSURANCE_POLICY_CREATED_AT].toISOString()) || null,
    [cols.INSURANCE_POLICY_EXPIRED_AT]: (company[colsCompanies.INSURANCE_POLICY_EXPIRED_AT] && company[colsCompanies.INSURANCE_POLICY_EXPIRED_AT].toISOString()) || null,
    [cols.RESIDENCY_CERTIFICATE_CREATED_AT]: (company[colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT] && company[colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT].toISOString()) || null,
    [cols.RESIDENCY_CERTIFICATE_EXPIRED_AT]: (company[colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT] && company[colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT].toISOString()) || null,
    [cols.INSURANCE_POLICY_NUMBER]: company[colsCompanies.INSURANCE_POLICY_NUMBER],
    [cols.BANK_COUNTRY_ID]: company[colsCompanies.BANK_COUNTRY_ID],
    [cols.LEGAL_CITY_COORDINATES]: company[colsCompanies.LEGAL_CITY_COORDINATES],
    [cols.HEAD_ROLE_ID]: company[colsCompanies.HEAD_ROLE_ID],
});

module.exports = {
    formatRecordToSaveFromOriginal,
};
