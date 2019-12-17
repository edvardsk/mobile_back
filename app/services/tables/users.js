const { one, oneOrNone, manyOrNone } = require('db');
const {
    insertUser,
    insertUsers,
    selectUser,
    selectUserWithDraftDriver,
    selectUserWithRole,
    selectUserByEmail,
    selectUserByEmailWithRole,
    selectUserWithRoleAndPhoneNumber,
    selectUserByEmailWithRoleAndFreezingStatus,
    selectUserRole,
    updateUser,
    selectUserByPassportNumber,
    selectUsersWithRoleByPermission,
    selectUserWithRoleAndConfirmationHash,
    selectUsersByCompanyIdPaginationSorting,
    selectCountUsersByCompanyId,

    selectUsersByCompanyIdAndDriverRolePaginationSorting,
    selectCountUsersByCompanyIdAndDriverRole,

    selectUserWithRoleAndFreezingStatus,
    selectFirstInCompanyByCompanyId,

    selectUsersPaginationSorting,
    selectCountUsers,
} = require('sql-helpers/users');

const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.USERS.COLUMNS;

const addUser = data => one(insertUser(data));

const getUser = id => oneOrNone(selectUser(id));

const getUserWithDraftDriverStrict = id => one(selectUserWithDraftDriver(id));

const getUserWithRole = id => oneOrNone(selectUserWithRole(id));

const getUserWithRoleAndPhoneNumber = id => oneOrNone(selectUserWithRoleAndPhoneNumber(id));

const getUserByEmail = email => oneOrNone(selectUserByEmail(email));

const getUserByEmailWithRole = email => oneOrNone(selectUserByEmailWithRole(email));

const getUserByEmailWithRoleAndFreezingData = email => oneOrNone(selectUserByEmailWithRoleAndFreezingStatus(email));

const getUserRole = id => one(selectUserRole(id))
    .then(({ name }) => name);

const addUserAsTransaction = data => [insertUser(data), OPERATIONS.ONE];

const addUsersAsTransaction = values => [insertUsers(values), OPERATIONS.MANY];

const updateUserAsTransaction = (id, data) => [updateUser(id, data), OPERATIONS.ONE];

const markAsFreezedAsTransaction = id => updateUserAsTransaction(id, {
    [cols.FREEZED]: true,
});

const getUserByPassportNumber = number => oneOrNone(selectUserByPassportNumber(number));

const getUsersWithRoleByPermission = permission => manyOrNone(selectUsersWithRoleByPermission(permission));

const getUserWithRoleAndConfirmationHashStrict = email => one(selectUserWithRoleAndConfirmationHash(email));

const getUserForAuthentication = id => oneOrNone(selectUserWithRoleAndFreezingStatus(id));

const getUserWithRoleAndFreezingData = id => oneOrNone(selectUserWithRoleAndFreezingStatus(id));

const getUsersByCompanyIdPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectUsersByCompanyIdPaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountUsersByCompanyId = (companyId, filter) => (
    one(selectCountUsersByCompanyId(companyId, filter))
        .then(({ count }) => +count)
);

const getCompanyDriversPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectUsersByCompanyIdAndDriverRolePaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountCompanyDrivers = (companyId, filter) => (
    one(selectCountUsersByCompanyIdAndDriverRole(companyId, filter))
        .then(({ count }) => +count)
);

const getFirstUserInCompanyStrict = companyId => (
    one(selectFirstInCompanyByCompanyId(companyId))
);

const getFirstUserInCompany = companyId => (
    oneOrNone(selectFirstInCompanyByCompanyId(companyId))
);

const getUsersPaginationSorting = (limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectUsersPaginationSorting(limit, offset, sortColumn, asc, filter))
);

const getCountUsers = filter => (
    one(selectCountUsers(filter))
        .then(({ count }) => +count)
);

const checkUserWithPassportNumberExistsOpposite = async (meta, number) => {
    const user = await getUserByPassportNumber(number);
    const { userId } = meta;
    return !user || user.id === userId;
};

const checkUserWithEmailExistsOpposite = async (meta, email) => {
    const user = await getUserByEmail(email);
    const { userId } = meta;
    return !user || user.id === userId;
};

const checkUserWithEmailExists = async (meta, email) => {
    const user = await getUserByEmail(email);
    return !!user;
};

const checkUserWithIdExists = async (meta, id) => {
    const user = await getUser(id);
    return !!user;
};

module.exports = {
    addUser,
    addUsersAsTransaction,
    getUser,
    getUserWithDraftDriverStrict,
    getUserWithRole,
    getUserWithRoleAndPhoneNumber,
    getUserByEmailWithRole,
    getUserByEmailWithRoleAndFreezingData,
    getUserByEmail,
    getUserRole,
    addUserAsTransaction,
    updateUserAsTransaction,
    markAsFreezedAsTransaction,
    getUsersWithRoleByPermission,
    getUserWithRoleAndConfirmationHashStrict,
    getUsersByCompanyIdPaginationSorting,
    getCountUsersByCompanyId,

    getCompanyDriversPaginationSorting,
    getCountCompanyDrivers,

    getUserForAuthentication,
    getUserWithRoleAndFreezingData,
    getFirstUserInCompanyStrict,
    getFirstUserInCompany,

    getUsersPaginationSorting,
    getCountUsers,

    checkUserWithPassportNumberExistsOpposite,
    checkUserWithEmailExistsOpposite,
    checkUserWithEmailExists,
    checkUserWithIdExists,
};
