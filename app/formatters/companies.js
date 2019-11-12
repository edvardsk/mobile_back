// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { Geo } = require('constants/instances');

const cols = SQL_TABLES.COMPANIES.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;

const formatInitialDataToSave = (body, userId) => ({
    [cols.USER_ID]: userId,
    [cols.NAME]: body[cols.NAME],
});

const formatCompanyDataOnStep2 = data => ({
    ...data,
    [cols.LEGAL_CITY_COORDINATES]: new Geo(
        data[cols.LEGAL_CITY_COORDINATES][HOMELESS_COLUMNS.LONGITUDE],
        data[cols.LEGAL_CITY_COORDINATES][HOMELESS_COLUMNS.LATITUDE],
    ),
});

const formatGeoPointToObject = string => {
    const [longitude, latitude] = string.slice(6, -1).split(' ');
    return {
        [HOMELESS_COLUMNS.LONGITUDE]: longitude,
        [HOMELESS_COLUMNS.LATITUDE]: latitude
    };
};

const formatLegalDataForTransporterAndHolderForResponse = company => ({
    [cols.LEGAL_CITY_COORDINATES]: company[cols.LEGAL_CITY_COORDINATES] && formatGeoPointToObject(company[cols.LEGAL_CITY_COORDINATES]),
    [cols.LEGAL_CITY_NAME]: company[cols.LEGAL_CITY_NAME],
    [cols.LEGAL_ADDRESS]: company[cols.LEGAL_ADDRESS],
    [cols.POST_ADDRESS]: company[cols.POST_ADDRESS],
    [cols.HEAD_COMPANY_FULL_NAME]: company[cols.HEAD_COMPANY_FULL_NAME],
    [cols.CONTRACT_SIGNER_FULL_NAME]: company[cols.CONTRACT_SIGNER_FULL_NAME],
    [cols.SETTLEMENT_ACCOUNT]: company[cols.SETTLEMENT_ACCOUNT],
    [cols.BANK_CODE]: company[cols.BANK_CODE],
    [cols.BANK_NAME]: company[cols.BANK_NAME],
    [cols.BANK_ADDRESS]: company[cols.BANK_ADDRESS],
    [HOMELESS_COLUMNS.BANK_COUNTRY]: company[HOMELESS_COLUMNS.BANK_COUNTRY],
});

const formatLegalDataForIndividualForwarderForResponse = (company, user) => ({
    [colsUsers.PASSPORT_NUMBER]: user[colsUsers.PASSPORT_NUMBER],
    [colsUsers.PASSPORT_ISSUING_AUTHORITY]: user[colsUsers.PASSPORT_ISSUING_AUTHORITY],
    [colsUsers.PASSPORT_CREATED_AT]: user[colsUsers.PASSPORT_CREATED_AT],
    [colsUsers.PASSPORT_EXPIRED_AT]: user[colsUsers.PASSPORT_EXPIRED_AT],
});

const formatLegalDataForSoleProprietorForwarderForResponse = (company, user) => ({
    [cols.LEGAL_CITY_COORDINATES]: company[cols.LEGAL_CITY_COORDINATES] && formatGeoPointToObject(company[cols.LEGAL_CITY_COORDINATES]),
    [cols.LEGAL_CITY_NAME]: company[cols.LEGAL_CITY_NAME],
    [cols.LEGAL_ADDRESS]: company[cols.LEGAL_ADDRESS],
    [cols.POST_ADDRESS]: company[cols.POST_ADDRESS],
    [cols.HEAD_COMPANY_FULL_NAME]: user[colsUsers.FULL_NAME],
    [cols.CONTRACT_SIGNER_FULL_NAME]: user[colsUsers.FULL_NAME],
    [cols.SETTLEMENT_ACCOUNT]: company[cols.SETTLEMENT_ACCOUNT],
    [cols.BANK_CODE]: company[cols.BANK_CODE],
    [cols.BANK_NAME]: company[cols.BANK_NAME],
    [cols.BANK_ADDRESS]: company[cols.BANK_ADDRESS],
    [HOMELESS_COLUMNS.BANK_COUNTRY]: company[HOMELESS_COLUMNS.BANK_COUNTRY],
});

const formatCompanyToResponse = company => ({
    id: company.id,
    [cols.NAME]: company[cols.NAME] || undefined,
    [cols.IDENTITY_NUMBER]: company[cols.IDENTITY_NUMBER],
    [cols.CREATED_AT]: company[cols.CREATED_AT],
    [cols.PRIMARY_CONFIRMED]: company[cols.PRIMARY_CONFIRMED],
    [cols.EDITING_CONFIRMED]: company[cols.EDITING_CONFIRMED],
    [HOMELESS_COLUMNS.HEAD_ROLE_NAME]: company[HOMELESS_COLUMNS.HEAD_ROLE_NAME],
});

const formatDataToApprove = () => ({
    [cols.PRIMARY_CONFIRMED]: true,
    [cols.EDITING_CONFIRMED]: true,
});

module.exports = {
    formatInitialDataToSave,
    formatCompanyDataOnStep2,
    formatLegalDataForTransporterAndHolderForResponse,
    formatLegalDataForIndividualForwarderForResponse,
    formatLegalDataForSoleProprietorForwarderForResponse,
    formatCompanyToResponse,
    formatGeoPointToObject,
    formatDataToApprove,
};

