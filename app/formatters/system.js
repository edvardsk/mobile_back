const uuid = require('uuid/v4');
const { ROLES, PERMISSIONS, ROLES_WITH_PERMISSIONS, FILE_LABELS } = require('../constants/system');

const formatRolesForDb = () => {
    const list = Object.values(ROLES).map(role => ({
        id: uuid(),
        name: role,
    }));
    return function () {
        return list;
    };
};
const getRolesForDb = formatRolesForDb();

const formatPermissionsForDb = () => {
    const list = Object.values(PERMISSIONS).map(permission => ({
        id: uuid(),
        name: permission,
    }));
    return function () {
        return list;
    };
};
const getPermissionsForDb = formatPermissionsForDb();

const getRolesToPermissionsForDb = () => (
    ROLES_WITH_PERMISSIONS.reduce((acc, roleWithPermissions) => {
        const [role, permissions] = roleWithPermissions;
        const result = permissions.map(permission => ({
            role_id: getRolesForDb().find(({ name }) => name === role).id,
            permission_id: getPermissionsForDb().find(({ name }) => name === permission).id,
        }));
        return [
            ...result,
            ...acc,
        ];
    }, [])
);

const getFileLabelsForDb = () => Object.values(FILE_LABELS).map(label => ({
    name: label,
}));

module.exports = {
    getRolesForDb,
    getPermissionsForDb,
    getRolesToPermissionsForDb,
    getFileLabelsForDb,
};
