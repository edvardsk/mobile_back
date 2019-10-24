const getRolesToPermissionsForDb = (allRoles, allPermissions, rolesWithPermissions) => (
    rolesWithPermissions.reduce((acc, roleWithPermissions) => {
        const [role, permissions] = roleWithPermissions;
        const result = permissions.map(permission => ({
            role_id: allRoles.find(({ name }) => name === role).id,
            permission_id: allPermissions.find(({ name }) => name === permission).id,
        }));
        return [
            ...result,
            ...acc,
        ];
    }, [])
);

module.exports = {
    getRolesToPermissionsForDb,
};
