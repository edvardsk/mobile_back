const { one } = require('db');
const {
    insertUserRole,
    insertUserRoles,
    updateUserRoleByUserId,
} = require('sql-helpers/users-to-roles');

const { OPERATIONS } = require('constants/postgres');

const addUserRole = (id, role) => one(insertUserRole(id, role));

const updateUserRole = (id, role) => one(updateUserRoleByUserId(id, role));

const updateUserRoleAsTransaction = (id, role) => [updateUserRoleByUserId(id, role), OPERATIONS.ONE];

const addUserRoleAsTransaction = (id, role) => [insertUserRole(id, role), OPERATIONS.ONE];

const addUserRolesAsTransaction = values => [insertUserRoles(values), OPERATIONS.MANY];

module.exports = {
    addUserRole,
    updateUserRole,
    updateUserRoleAsTransaction,
    addUserRoleAsTransaction,
    addUserRolesAsTransaction,
};
