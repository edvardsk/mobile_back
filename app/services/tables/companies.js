// sql-helpers
const {
    insertCompany,
} = require('sql-helpers/companies');

// constants
const { OPERATIONS } = require('constants/postgres');

const addCompanyAsTransaction = data => [insertCompany(data), OPERATIONS.ONE];

module.exports = {
    addCompanyAsTransaction,
};
