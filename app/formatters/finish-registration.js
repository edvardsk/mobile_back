// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// formatters
const { formatGeoPointToObject } = require('./companies');

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;

const formatCompanyForTransporterToSave = data => ({
    [colsCompanies.NAME]: data[colsCompanies.NAME],
    [colsCompanies.OWNERSHIP_TYPE]: data[colsCompanies.OWNERSHIP_TYPE],
    [colsCompanies.REGISTERED_AT]: data[colsCompanies.REGISTERED_AT],
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || null,
});

const formatCompanyForHolderToSave = data => ({
    [colsCompanies.NAME]: data[colsCompanies.NAME],
    [colsCompanies.OWNERSHIP_TYPE]: data[colsCompanies.OWNERSHIP_TYPE],
    [colsCompanies.REGISTERED_AT]: data[colsCompanies.REGISTERED_AT],
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || null,
});

const formatCompanyForIndividualForwarderToSave = data => ({
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || null,
});

const formatCompanyForSoleProprietorForwarderToSave = data => ({
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || null,
    [colsCompanies.NAME]: data[colsCompanies.NAME] || null,
    [colsCompanies.REGISTERED_AT]: data[colsCompanies.REGISTERED_AT] || null,
});

const formatDataForTransporterAndHolderForStep1Response = data => ({
    [colsCompanies.NAME]: data[colsCompanies.NAME],
    [colsCompanies.OWNERSHIP_TYPE]: data[colsCompanies.OWNERSHIP_TYPE],
    [colsCompanies.REGISTERED_AT]: data[colsCompanies.REGISTERED_AT],
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || '',
});

const formatDataForIndividualForwarderForStep1Response = data => ({
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || '',
});

const formatDataForSoleProprietorForwarderForStep1Response = data => ({
    [colsCompanies.NAME]: data[colsCompanies.NAME],
    [colsCompanies.REGISTERED_AT]: data[colsCompanies.REGISTERED_AT],
    [colsCompanies.COUNTRY_ID]: data[colsCompanies.COUNTRY_ID],
    [colsCompanies.IDENTITY_NUMBER]: data[colsCompanies.IDENTITY_NUMBER],
    [colsCompanies.WEBSITE]: data[colsCompanies.WEBSITE] || '',
});

const formatDataForTransporterAndHolderForStep2Response = data => ({
    [colsCompanies.LEGAL_CITY_COORDINATES]: data[colsCompanies.LEGAL_CITY_COORDINATES] && formatGeoPointToObject(data[colsCompanies.LEGAL_CITY_COORDINATES]),
    [colsCompanies.LEGAL_CITY_NAME]: data[colsCompanies.LEGAL_CITY_NAME],
    [colsCompanies.LEGAL_ADDRESS]: data[colsCompanies.LEGAL_ADDRESS],
    [colsCompanies.POST_ADDRESS]: data[colsCompanies.POST_ADDRESS],
    [colsCompanies.HEAD_COMPANY_FULL_NAME]: data[colsCompanies.HEAD_COMPANY_FULL_NAME],
    [colsCompanies.CONTRACT_SIGNER_FULL_NAME]: data[colsCompanies.CONTRACT_SIGNER_FULL_NAME],
    [colsCompanies.SETTLEMENT_ACCOUNT]: data[colsCompanies.SETTLEMENT_ACCOUNT],
    [colsCompanies.BANK_CODE]: data[colsCompanies.BANK_CODE],
    [colsCompanies.BANK_NAME]: data[colsCompanies.BANK_NAME],
    [colsCompanies.BANK_ADDRESS]: data[colsCompanies.BANK_ADDRESS],
    [HOMELESS_COLUMNS.BANK_COUNTRY]: data[HOMELESS_COLUMNS.BANK_COUNTRY],
});

const formatDataForTransporterForStep3Response = (company, _, organizations) => ({
    [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER],
    [colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT],
    [colsCompanies.INSURANCE_POLICY_NUMBER]: company[colsCompanies.INSURANCE_POLICY_NUMBER],
    [colsCompanies.INSURANCE_COMPANY_NAME]: company[colsCompanies.INSURANCE_COMPANY_NAME],
    [colsCompanies.INSURANCE_POLICY_CREATED_AT]: company[colsCompanies.INSURANCE_POLICY_CREATED_AT],
    [colsCompanies.INSURANCE_POLICY_EXPIRED_AT]: company[colsCompanies.INSURANCE_POLICY_EXPIRED_AT],
    [colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT]: company[colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT],
    [colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT]: company[colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT],
    [HOMELESS_COLUMNS.OTHER_ORGANIZATIONS]: organizations,
});

const formatDataForHolderForStep3Response = (company, _, organizations) => ({
    [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER],
    [colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT],
    [colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT]: company[colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT],
    [colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT]: company[colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT],
    [HOMELESS_COLUMNS.OTHER_ORGANIZATIONS]: organizations,
});

const formatDataForIndividualForwarderForStep3Response = (company, user) => ({
    [colsUsers.PASSPORT_NUMBER]: user[colsUsers.PASSPORT_NUMBER],
    [colsUsers.PASSPORT_ISSUING_AUTHORITY]: user[colsUsers.PASSPORT_ISSUING_AUTHORITY],
    [colsUsers.PASSPORT_CREATED_AT]: user[colsUsers.PASSPORT_CREATED_AT],
    [colsUsers.PASSPORT_EXPIRED_AT]: user[colsUsers.PASSPORT_EXPIRED_AT],
});

const formatDataForSoleProprietorForwarderForStep3Response = (company, user) => ({
    [colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER]: company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER],
    [colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT]: company[colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT],
    [colsUsers.PASSPORT_NUMBER]: user[colsUsers.PASSPORT_NUMBER],
    [colsUsers.PASSPORT_ISSUING_AUTHORITY]: user[colsUsers.PASSPORT_ISSUING_AUTHORITY],
    [colsUsers.PASSPORT_CREATED_AT]: user[colsUsers.PASSPORT_CREATED_AT],
    [colsUsers.PASSPORT_EXPIRED_AT]: user[colsUsers.PASSPORT_EXPIRED_AT],
});

module.exports = {
    formatCompanyForTransporterToSave,
    formatCompanyForHolderToSave,
    formatCompanyForIndividualForwarderToSave,
    formatCompanyForSoleProprietorForwarderToSave,
    formatDataForTransporterAndHolderForStep1Response,
    formatDataForIndividualForwarderForStep1Response,
    formatDataForSoleProprietorForwarderForStep1Response,
    formatDataForTransporterAndHolderForStep2Response,
    formatDataForTransporterForStep3Response,
    formatDataForHolderForStep3Response,
    formatDataForIndividualForwarderForStep3Response,
    formatDataForSoleProprietorForwarderForStep3Response,
};
