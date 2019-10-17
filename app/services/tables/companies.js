const { oneOrNone, one } = require('db');

// sql-helpers
const {
    insertCompany,
    updateCompany,
    selectCompanyByUserId,
    selectCompanyBySettlementAccount,
} = require('sql-helpers/companies');

// constants
const { OPERATIONS } = require('constants/postgres');

const getCompanyByUserId = userId => oneOrNone(selectCompanyByUserId(userId));

const getCompanyBySettlementAccount = account => oneOrNone(selectCompanyBySettlementAccount(account));

const getCompanyByUserIdStrict = userId => one(selectCompanyByUserId(userId));

const addCompanyAsTransaction = data => [insertCompany(data), OPERATIONS.ONE];

const updateCompanyAsTransaction = (id, data) => [updateCompany(id, data), OPERATIONS.ONE];

const checkCompanyWithSettlementAccountExists = async (props, account) => {
    const company = await getCompanyBySettlementAccount(account);
    return !company;
};

module.exports = {
    getCompanyByUserId,
    getCompanyByUserIdStrict,
    addCompanyAsTransaction,
    updateCompanyAsTransaction,
    checkCompanyWithSettlementAccountExists,
};
