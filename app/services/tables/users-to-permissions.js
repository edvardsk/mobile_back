const { one, manyOrNone } = require('db');
const {
    insertUserPermission,
    deleteUserPermission,
    selectUserPermissions,
} = require('sql-helpers/users-to-permissions');

const { OPERATIONS } = require('constants/postgres');

const addUserPermission = (id, permission) => one(insertUserPermission(id, permission));

const removeUserPermission = (id, permission) => one(deleteUserPermission(id, permission));

const addUserPermissionAsTransaction = (id, permission) => [insertUserPermission(id, permission), OPERATIONS.ONE];

const getUserPermissions = userId => manyOrNone(selectUserPermissions(userId))
    .then(permissions => permissions.map(permission => permission.name));

module.exports = {
    addUserPermission,
    addUserPermissionAsTransaction,
    removeUserPermission,
    getUserPermissions,
};
