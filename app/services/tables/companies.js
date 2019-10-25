const { oneOrNone, one } = require('db');

// sql-helpers
const {
    insertCompany,
    updateCompany,
    selectCompanyByUserId,
    selectCompanyBySettlementAccountWithFirstOwner,
    selectCompanyByIdentityNumberWithFirstOwner,
    selectCompanyByNameWithFirstOwner,
    selectCompanyByStateRegistrationCertificateNumberWithFirstOwner,
} = require('sql-helpers/companies');

// constants
const { OPERATIONS } = require('constants/postgres');
const { HOMELESS_COLUMNS } = require('constants/tables');

const getCompanyByUserId = userId => oneOrNone(selectCompanyByUserId(userId));

const getCompanyBySettlementAccountWithFirstOwner = account => oneOrNone(selectCompanyBySettlementAccountWithFirstOwner(account));

const getCompanyByIdentityNumberWithFirstOwner = account => oneOrNone(selectCompanyByIdentityNumberWithFirstOwner(account));

const getCompanyByNameWithFirstOwner = name => oneOrNone(selectCompanyByNameWithFirstOwner(name));

const getCompanyByStateRegistrationCertificateNumberWithFirstOwner = number => (
    oneOrNone(selectCompanyByStateRegistrationCertificateNumberWithFirstOwner(number)
    ));

const getCompanyByUserIdStrict = userId => one(selectCompanyByUserId(userId));

const addCompanyAsTransaction = data => [insertCompany(data), OPERATIONS.ONE];

const updateCompanyAsTransaction = (id, data) => [updateCompany(id, data), OPERATIONS.ONE];

const checkCompanyWithSettlementAccountExistsOpposite = async (meta, account) => {
    const company = await getCompanyBySettlementAccountWithFirstOwner(account);
    const { userId } = meta;
    return !company || company[HOMELESS_COLUMNS.OWNER_ID] === userId;
};

const checkCompanyWithIdentityNumberExistsOpposite = async (meta, number) => {
    const company = await getCompanyByIdentityNumberWithFirstOwner(number);
    const { userId } = meta;
    return !company || company[HOMELESS_COLUMNS.OWNER_ID] === userId;
};

const checkCompanyWithNameExistsOpposite = async (meta, name) => {
    const company = await getCompanyByNameWithFirstOwner(name);
    const { userId } = meta;
    return !company || company[HOMELESS_COLUMNS.OWNER_ID] === userId;
};

const checkCompanyWithStateRegistrationCertificateNumberExistsOpposite = async (meta, number) => {
    const company = await getCompanyByStateRegistrationCertificateNumberWithFirstOwner(number);
    const { userId } = meta;
    return !company || company[HOMELESS_COLUMNS.OWNER_ID] === userId;
};

module.exports = {
    getCompanyByUserId,
    getCompanyByUserIdStrict,
    addCompanyAsTransaction,
    updateCompanyAsTransaction,
    checkCompanyWithSettlementAccountExistsOpposite,
    checkCompanyWithIdentityNumberExistsOpposite,
    checkCompanyWithNameExistsOpposite,
    checkCompanyWithStateRegistrationCertificateNumberExistsOpposite,
};
