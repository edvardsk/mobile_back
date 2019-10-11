const { one } = require('db');
const {
    insertUserRole,
    updateUserRoleByUserId,
} = require('sql-helpers/users-to-roles');

const { OPERATIONS } = require('constants/postgres');

const addUserRole = (id, role) => one(insertUserRole(id, role));

const updateUserRole = (id, role) => one(updateUserRoleByUserId(id, role));

const addUserRoleAsTransaction = (id, role) => [insertUserRole(id, role), OPERATIONS.ONE];

module.exports = {
    addUserRole,
    updateUserRole,
    addUserRoleAsTransaction,
};
