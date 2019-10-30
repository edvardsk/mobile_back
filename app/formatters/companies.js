// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { Geo } = require('constants/instances');

const cols = SQL_TABLES.COMPANIES.COLUMNS;

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

const formatLegalDataForResponse = data => ({
    [cols.LEGAL_CITY_COORDINATES]: formatGeoPointToObject(data[cols.LEGAL_CITY_COORDINATES]),
    [cols.LEGAL_ADDRESS]: data[cols.LEGAL_ADDRESS],
    [cols.POST_ADDRESS]: data[cols.POST_ADDRESS],
    [cols.HEAD_COMPANY_FULL_NAME]: data[cols.HEAD_COMPANY_FULL_NAME],
    [cols.CONTRACT_SIGNER_FULL_NAME]: data[cols.CONTRACT_SIGNER_FULL_NAME],
    [cols.SETTLEMENT_ACCOUNT]: data[cols.SETTLEMENT_ACCOUNT],
    [cols.BANK_CODE]: data[cols.BANK_CODE],
    [cols.BANK_NAME]: data[cols.BANK_NAME],
    [cols.BANK_ADDRESS]: data[cols.BANK_ADDRESS],
    [HOMELESS_COLUMNS.BANK_COUNTRY]: data[HOMELESS_COLUMNS.BANK_COUNTRY],
});

module.exports = {
    formatInitialDataToSave,
    formatCompanyDataOnStep2,
    formatLegalDataForResponse,
};
