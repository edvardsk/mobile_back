// constants
const { SQL_TABLES } = require('constants/tables');
const { SqlArray } = require('constants/instances');

const cols = SQL_TABLES.CARGOS.COLUMNS;

const formatRecordToSave = (companyId, cargoId, data) => ({
    ...data,
    id: cargoId,
    [cols.COMPANY_ID]: companyId,
    [cols.LOADING_METHODS]: new SqlArray(data[cols.LOADING_METHODS]),
    [cols.GUARANTEES]: new SqlArray(data[cols.GUARANTEES]),
});

module.exports = {
    formatRecordToSave,
};
