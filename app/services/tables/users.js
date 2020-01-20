const { one, oneOrNone } = require('db');
const {
    selectUserByName,

    insertUser,
    selectUser,
    updateUser,
} = require('sql-helpers/users');

const { OPERATIONS } = require('constants/postgres');
// const { SQL_TABLES } = require('constants/tables');

// const cols = SQL_TABLES.USERS.COLUMNS;

const getUserByName = name => oneOrNone(selectUserByName(name));

const addUser = data => one(insertUser(data));

const getUser = id => oneOrNone(selectUser(id));

const addUserAsTransaction = data => [insertUser(data), OPERATIONS.ONE];

const updateUserAsTransaction = (id, data) => [updateUser(id, data), OPERATIONS.ONE];

// const checkUserWithEmailExists = async (meta, email) => {
//     const user = await getUserByEmail(email);
//     return !!user;
// };
//
// const checkUserWithIdExists = async (meta, id) => {
//     const user = await getUser(id);
//     return !!user;
// };

module.exports = {
    addUser,
    getUser,
    getUserByName,
    addUserAsTransaction,
    updateUserAsTransaction,
};
