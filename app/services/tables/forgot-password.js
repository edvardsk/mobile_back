const { one, oneOrNone, manyOrNone, tx } = require('db');
const {
    insertRecord,
    selectRecordByHash,
    selectLatestActiveRecordByUserId,
    deleteRecordsByUserId,
} = require('sql-helpers/forgot-password');
const {
    updateUser,
} = require('sql-helpers/users');
const CryptService = require('services/crypto');
const { SQL_TABLES } = require('constants/tables');

const addSession = data => one(insertRecord(data));

const getRecordByHash = hash => oneOrNone(selectRecordByHash(hash));

const getLatestActiveSessionByUserId = userId => oneOrNone(selectLatestActiveRecordByUserId(userId));

const deleteSessionsByUserId = userId => manyOrNone(deleteRecordsByUserId(userId));

const changePassword = async (userId, password) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const { hash, key } = await CryptService.hashPassword(password);
    const userData = {
        [colsUsers.KEY]: key,
        [colsUsers.PASSWORD]: hash,
    };
    return changePasswordBatch(userId, userData);
};

const changePasswordBatch = (userId, userData) => tx(t => {
    const q1 = t.manyOrNone(deleteRecordsByUserId(userId));
    const q2 = t.one(updateUser(userId, userData));
    return t.batch([q1, q2]);
});

module.exports = {
    addSession,
    getRecordByHash,
    getLatestActiveSessionByUserId,
    deleteSessionsByUserId,
    changePassword,
};
