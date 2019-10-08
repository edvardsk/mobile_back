const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.ROLES.COLUMNS;

const formatRolesForResponse = (roles, translator) => roles.map(role => formatRoleForResponse(role, translator));

const formatRoleForResponse = role => ({
    id: role.id,
    [cols.NAME]: role[cols.NAME],
});

module.exports = {
    formatRolesForResponse,
};
