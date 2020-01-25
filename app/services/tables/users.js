const { one, oneOrNone } = require('db');
const {
    selectUserByName,

    insertUser,
    selectUser,
    updateUser,
} = require('sql-helpers/users');

const { OPERATIONS } = require('constants/postgres');

const getUserByName = name => oneOrNone(selectUserByName(name));

const addUser = data => one(insertUser(data));

const getUser = id => oneOrNone(selectUser(id));

const addUserAsTransaction = data => [insertUser(data), OPERATIONS.ONE];

const updateUserAsTransaction = (id, data) => [updateUser(id, data), OPERATIONS.ONE];

module.exports = {
    addUser,
    getUser,
    getUserByName,
    addUserAsTransaction,
    updateUserAsTransaction,
};
