const { manyOrNone } = require('db');
const {
    selectUserPermissions,
} = require('sql-helpers/roles-to-permissions');

const getUserPermissions = userId => manyOrNone(selectUserPermissions(userId))
    .then(permissions => permissions.map(permission => permission.name));

module.exports = {
    getUserPermissions,
};
