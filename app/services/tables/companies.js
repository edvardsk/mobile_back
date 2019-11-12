const { oneOrNone, one, manyOrNone } = require('db');

// sql-helpers
const {
    insertCompany,
    updateCompany,
    selectCompanyById,
    selectCompanyByUserId,
    selectCompanyBySettlementAccountWithFirstOwner,
    selectCompanyByIdentityNumberWithFirstOwner,
    selectCompanyByNameWithFirstOwner,
    selectCompanyByStateRegistrationCertificateNumberWithFirstOwner,
    selectCompaniesPaginationSorting,
    selectCountCompanies,
} = require('sql-helpers/companies');

// services
const CountriesService = require('./countries');

// constants
const { OPERATIONS } = require('constants/postgres');
const { HOMELESS_COLUMNS, SQL_TABLES } = require('constants/tables');

const MAP_COUNTRIES_AND_SETTLEMENT_ACCOUNT_LENGTH = {
    belarus: 28,
    ukraine: 29,
    russia: 20,
};

const cols = SQL_TABLES.COMPANIES.COLUMNS;
const colsCountries = SQL_TABLES.COUNTRIES.COLUMNS;

const getCompany = id => oneOrNone(selectCompanyById(id));

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

const getCompaniesPaginationSorting = (limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectCompaniesPaginationSorting(limit, offset, sortColumn, asc, filter))
);

const getCountCompanies = (filter) => (
    one(selectCountCompanies(filter))
        .then(({ count }) => +count)
);

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

const checkCompanyWithIdExists = async (meta, companyId) => {
    const company = await getCompany(companyId);
    return !!company;
};

const validateSettlementAccount = async (props, account, schema, key, data) => {
    const country = await CountriesService.getCountryStrict(data[cols.BANK_COUNTRY_ID]);
    const countryName = country[colsCountries.NAME];
    const accountLength = MAP_COUNTRIES_AND_SETTLEMENT_ACCOUNT_LENGTH[countryName];
    return accountLength === account.length;
};

module.exports = {
    getCompany,
    getCompanyByUserId,
    getCompanyByUserIdStrict,
    addCompanyAsTransaction,
    updateCompanyAsTransaction,
    getCompaniesPaginationSorting,
    getCountCompanies,

    checkCompanyWithSettlementAccountExistsOpposite,
    checkCompanyWithIdentityNumberExistsOpposite,
    checkCompanyWithNameExistsOpposite,
    checkCompanyWithStateRegistrationCertificateNumberExistsOpposite,
    checkCompanyWithIdExists,
    validateSettlementAccount,
};
