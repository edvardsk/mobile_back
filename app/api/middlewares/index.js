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

// helpers
const { extractToken } = require('helpers');
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
        try {
            const token = extractToken(req);
            const isTokenValid = TokenService.verifyJWToken(token);
            const decodedData = TokenService.decodeJWToken(token);
            const userId = get(decodedData, 'id');

            if (!isValidUUID(userId) || !isTokenValid) {
                return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN);
            }

            const user = await UsersService.getUserWithRole(userId);

            if (!user) {
                return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN);
            }

            const permissions = await PermissionsService.getAllUserPermissions(user.id);

            res.locals.user = user;
            res.locals.permissions = permissions;
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

const isHasPermissions = (permissions = []) => (req, res, next) => {
    try {
        const userPermissions = res.locals.permissions;
        if (!permissions.every(permission => userPermissions.includes(permission))) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    isHasPermissions,
    isAuthenticated,
};
