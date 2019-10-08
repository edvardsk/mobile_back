const { one, oneOrNone, tx } = require('db');
const {
    insertRecord,
    selectRecordByHash,
    deleteRecordById,
} = require('sql-helpers/email-confirmation-hashes');
const {
    updateUserRoleByUserId,
} = require('sql-helpers/users-to-roles');

const addRecord = data => one(insertRecord(data));

const getRecordByHash = hash => oneOrNone(selectRecordByHash(hash));

const deleteRecord = id => one(deleteRecordById(id));

const confirmEmail = (id, userId, role) => tx(t => {
    const q1 = t.one(deleteRecordById(id));
    const q2 = t.one(updateUserRoleByUserId(userId, role));
    return t.batch([q1, q2]);
});

module.exports = {
    addRecord,
    getRecordByHash,
    deleteRecord,
    confirmEmail,
};
