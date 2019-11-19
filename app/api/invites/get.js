const { success } = require('api/response');

const RolesService = require('services/tables/roles');
const { ROLES_TO_INVITE } = require('constants/system');
const { formatRolesForResponse } = require('formatters/roles');

const getInviteRoles = async (req, res, next) => {
    try {
        const roles = await RolesService.getRolesByNames(ROLES_TO_INVITE);
        return success(res, { roles: formatRolesForResponse(roles) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInviteRoles,
};
