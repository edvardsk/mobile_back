const { one } = require('db');
const {
    insertUserRole,
    updateUserRoleByUserId,
} = require('sql-helpers/users-to-roles');

const addUserRole = (id, role) => one(insertUserRole(id, role));

const updateUserRole = (id, role) => one(updateUserRoleByUserId(id, role));

module.exports = {
    addUserRole,
    updateUserRole,
};
