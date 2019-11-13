const { manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    selectRecordsByCompanyId,
} = require('sql-helpers/cargos');

// constants
const { OPERATIONS } = require('constants/postgres');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const getRecordsByCompanyId = companyId => manyOrNone(selectRecordsByCompanyId(companyId));

module.exports = {
    addRecordAsTransaction,
    getRecordsByCompanyId,
};
