const { manyOrNone } = require('db');
const {
    selectAllPermissionsByUserId,
} = require('sql-helpers/permissions');

// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.PERMISSIONS.COLUMNS;

const getAllUserPermissions = userId => manyOrNone(selectAllPermissionsByUserId(userId))
    .then(permissions => permissions.map(permission => permission[cols.NAME]));

module.exports = {
    getAllUserPermissions,
};
