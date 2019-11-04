const { get } = require('lodash');
const { reject } = require('api/response');

// services
const TokenService = require('services/token');
const UsersService = require('services/tables/users');
const PermissionsService = require('services/tables/permissions');

// constants
const { ERRORS } = require('constants/errors');
const { ALLOWED_ROUTES } = require('constants/routes');
const { ERROR_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { MAP_COMPANY_OWNERS_TO_MAIN_ROLES } = require('constants/system');

// helpers
const { extractToken, isControlRole } = require('helpers');
const { isValidUUID } = require('helpers/validators');

const isAllowedRoute = req => {
    return (req.method === 'GET' && ALLOWED_ROUTES.GET.has(req.baseUrl)) ||
        (req.method === 'POST' && ALLOWED_ROUTES.POST.has(req.baseUrl)) ||
        (req.method === 'PUT' && ALLOWED_ROUTES.PUT.has(req.baseUrl)) ||
        (req.method === 'DELETE' && ALLOWED_ROUTES.DELETE.has(req.baseUrl));
};

const isAuthenticated = async (req, res) => {
    if (isAllowedRoute(req)) {
        return req.next();
    } else {
        const colsFreezingHistory = SQL_TABLES.FREEZING_HISTORY.COLUMNS;
        try {
            const token = extractToken(req);
            const isTokenValid = TokenService.verifyJWToken(token);
            const decodedData = TokenService.decodeJWToken(token);
            const userId = get(decodedData, 'id');

            if (!isValidUUID(userId) || !isTokenValid) {
                return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN);
            }

            const user = await UsersService.getUserForAuthentication(userId);

            if (!user) {
                return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN);
            }

            if (user[colsFreezingHistory.FREEZED]) {
                return reject(res, ERRORS.AUTHENTICATION.FREEZED, {}, ERROR_CODES.FORBIDDEN);
            }

            const permissions = await PermissionsService.getAllUserPermissions(user.id);

            res.locals.user = user;
            res.locals.permissions = new Set(permissions);
            res.locals.user.isControlRole = isControlRole(user.role);

            return req.next();
        } catch (error) {
            logger.error(error);
            if (error.name === 'TokenExpiredError') {
                return reject(res, ERRORS.AUTHENTICATION.EXPIRED_TOKEN);
            }
            return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN, error);
        }
    }
};

const isHasPermissions = (permissionsOrGetter = []) => (req, res, next) => {
    try {
        let permissions;
        if (typeof permissionsOrGetter === 'function') {
            const params = {
                params: req.params,
            };
            permissions = permissionsOrGetter(params);

        } else {
            permissions = permissionsOrGetter;
        }
        const userPermissions = res.locals.permissions;
        if (!permissions.every(permission => userPermissions.has(permission))) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }
        next();
    } catch (error) {
        next(error);
    }
};

const injectShadowCompanyHeadByMeOrId = async (req, res, next) => {
    try {
        const { role } = res.locals.user;
        if (isControlRole(role)) {
            const companyId = req.params.meOrId;
            if (!isValidUUID(companyId)) {
                return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
            }
            const headUser = await UsersService.getFirstUserInCompany(companyId);
            if (!headUser) {
                return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
            }

            const shadowRole = headUser[HOMELESS_COLUMNS.ROLE];

            const mainShadowRole = MAP_COMPANY_OWNERS_TO_MAIN_ROLES[shadowRole];

            if (!mainShadowRole) {
                return reject(res, ERRORS.SYSTEM.ERROR);
            }

            res.locals.shadowMainUserRole = mainShadowRole;
            res.locals.shadowUserId = headUser.id;
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    isHasPermissions,
    isAuthenticated,
    injectShadowCompanyHeadByMeOrId,
};
