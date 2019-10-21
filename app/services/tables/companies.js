const { oneOrNone, one } = require('db');

// sql-helpers
const {
    insertCompany,
    updateCompany,
    selectCompanyByUserId,
    selectCompanyBySettlementAccount,
    selectCompanyByIdentityNumberWithFirstOwner,
} = require('sql-helpers/companies');

// constants
const { OPERATIONS } = require('constants/postgres');
const { HOMELESS_COLUMNS } = require('constants/tables');

const getCompanyByUserId = userId => oneOrNone(selectCompanyByUserId(userId));

const getCompanyBySettlementAccount = account => oneOrNone(selectCompanyBySettlementAccount(account));

const getCompanyByIdentityNumberWithFirstOwner = account => oneOrNone(selectCompanyByIdentityNumberWithFirstOwner(account));

const getCompanyByUserIdStrict = userId => one(selectCompanyByUserId(userId));

const addCompanyAsTransaction = data => [insertCompany(data), OPERATIONS.ONE];

const updateCompanyAsTransaction = (id, data) => [updateCompany(id, data), OPERATIONS.ONE];

const checkCompanyWithSettlementAccountExists = async (props, account) => {
    const company = await getCompanyBySettlementAccount(account);
    return !company;
};

const checkCompanyWithIdentityNumberExists = async (meta, number) => {
    const company = await getCompanyByIdentityNumberWithFirstOwner(number);
    const { userId } = meta;
    return !company || company[HOMELESS_COLUMNS.OWNER_ID] === userId;
};

module.exports = {
    getCompanyByUserId,
    getCompanyByUserIdStrict,
    addCompanyAsTransaction,
    updateCompanyAsTransaction,
    checkCompanyWithSettlementAccountExists,
    checkCompanyWithIdentityNumberExists,
};
