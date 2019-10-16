const { oneOrNone } = require('db');

// sql-helpers
const {
    insertCompany,
    updateCompany,
    selectCompanyByUserId,
} = require('sql-helpers/companies');

// constants
const { OPERATIONS } = require('constants/postgres');

const getCompanyByUserId = userId => oneOrNone(selectCompanyByUserId(userId));

const addCompanyAsTransaction = data => [insertCompany(data), OPERATIONS.ONE];

const updateCompanyAsTransaction = (id, data) => [updateCompany(id, data), OPERATIONS.ONE];

module.exports = {
    getCompanyByUserId,
    addCompanyAsTransaction,
    updateCompanyAsTransaction,
};
