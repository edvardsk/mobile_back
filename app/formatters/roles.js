const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.ROLES.COLUMNS;

const formatRolesForResponse = (roles, translator) => roles.map(role => formatRoleForResponse(role, translator));

const formatRoleForResponse = (role, translator) => ({
    id: role.id,
    [cols.NAME]: translator(role[cols.NAME]),
});

module.exports = {
    formatRolesForResponse,
};
