const { one, oneOrNone } = require('db');
const {
    insertUser,
    selectUser,
    selectUserWithRole,
    selectUserByEmail,
    selectUserByEmailWithRole,
    selectUserRole,
    updateUser,
    selectUserByPassportNumber,
} = require('sql-helpers/users');

const { OPERATIONS } = require('constants/postgres');

const addUser = data => one(insertUser(data));

const getUser = id => oneOrNone(selectUser(id));

const getUserWithRole = id => oneOrNone(selectUserWithRole(id));

const getUserByEmail = email => oneOrNone(selectUserByEmail(email));

const getUserByEmailWithRole = email => oneOrNone(selectUserByEmailWithRole(email));

const getUserRole = id => one(selectUserRole(id))
    .then(({ name }) => name);

const addUserAsTransaction = data => [insertUser(data), OPERATIONS.ONE];

const updateUserAsTransaction = (id, data) => [updateUser(id, data), OPERATIONS.ONE];

const getUserByPassportNumber = number => oneOrNone(selectUserByPassportNumber(number));

const checkUserWithPassportNumberExists = async (meta, number) => {
    const user = await getUserByPassportNumber(number);
    const { userId } = meta;
    return !user || user.id === userId;
};

module.exports = {
    addUser,
    getUser,
    getUserWithRole,
    getUserByEmailWithRole,
    getUserByEmail,
    getUserRole,
    addUserAsTransaction,
    updateUserAsTransaction,
    checkUserWithPassportNumberExists,
};
