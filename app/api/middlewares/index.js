const { get } = require('lodash');
const { match } = require('path-to-regexp');
const { reject } = require('api/response');

// services
const TokenService = require('services/token');
const UsersService = require('services/tables/users');
const PermissionsService = require('services/tables/permissions');
const CompaniesService = require('services/tables/companies');
const DriversService = require('services/tables/drivers');

// constants
const { ERRORS } = require('constants/errors');
const { ALLOWED_ROUTES } = require('constants/routes');
const { ERROR_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { MAP_ROLES_TO_MAIN_ROLE, SET_DRIVER_ROLES } = require('constants/system');

// helpers
const { extractToken, isControlRole } = require('helpers');
const { isValidUUID } = require('helpers/validators');

const isAllowedRoute = req => {
    const url = req.baseUrl;

    const GET_ARRAY = Array.from(ALLOWED_ROUTES.GET);

    return (req.method === 'GET' && GET_ARRAY.some(route => { // todo: refactor it
        const regexp = match(route);
        return !!regexp(url);
    })) ||
        (req.method === 'POST' && ALLOWED_ROUTES.POST.has(req.baseUrl)) ||
        (req.method === 'PUT' && ALLOWED_ROUTES.PUT.has(req.baseUrl)) ||
        (req.method === 'DELETE' && ALLOWED_ROUTES.DELETE.has(req.baseUrl)) ||
        (url.endsWith('.websocket'));
};

const isAuthenticated = async (req, res) => {
    if (isAllowedRoute(req)) {
        return req.next();
    } else {
        const colsUsers = SQL_TABLES.USERS.COLUMNS;
        try {
            const token = extractToken(req);
            const isTokenValid = TokenService.verifyJWToken(token);
            const decodedData = TokenService.decodeJWToken(token);
            const userId = get(decodedData, 'id');

            if (!isValidUUID(userId) || !isTokenValid) {
                return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN);
            }

            const user = await UsersService.getUserForAuthentication(userId); // todo: remove extra joins

            if (!user) {
                return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN);
            }

            if (user[colsUsers.FREEZED]) {
                return reject(res, ERRORS.AUTHENTICATION.FREEZED, {}, ERROR_CODES.FORBIDDEN);
            }

            const permissions = await PermissionsService.getAllUserPermissions(user.id);

            res.locals.user = user;
            res.locals.permissions = new Set(permissions);
            res.locals.isControlRole = isControlRole(user.role);
            res.locals.isDriver = SET_DRIVER_ROLES.has(user.role);

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

const isHasPermissions = (...permissionsParams) => (req, res, next) => {
    try {
        if (!permissionsParams.some(permissionsOrGetter => {
            let permissions;
            if (typeof permissionsOrGetter === 'function') {
                const params = {
                    params: req.params,
                    targetRole: res.locals.targetRole,
                };
                permissions = permissionsOrGetter(params);
                if (!permissions) {
                    return false;
                }

            } else {
                permissions = permissionsOrGetter;
            }
            const userPermissions = res.locals.permissions;
            return permissions.every(permission => userPermissions.has(permission));
        })) {
            return reject(res, {}, {}, ERROR_CODES.FORBIDDEN);
        }

        next();
    } catch (error) {
        next(error);
    }
};

const injectTargetRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await UsersService.getUserWithRole(userId);
        res.locals.targetRole = MAP_ROLES_TO_MAIN_ROLE[user[HOMELESS_COLUMNS.ROLE]];

        next();
    } catch (error) {
        next(error);
    }
};

const injectCompanyData = async (req, res, next) => {
    try {
        const { role } = res.locals.user;
        if (isControlRole(role)) {
            const companyId = req.params.meOrId;
            const company = await CompaniesService.getCompany(companyId);
            if (!company) {
                return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
            }
            res.locals.company = company;
        } else {
            const userId = res.locals.user.id;
            res.locals.company = await CompaniesService.getCompanyByUserId(userId);
        }
        next();
    } catch (error) {
        next(error);
    }
};

const injectDriverData = async (req, res, next) => {
    try {
        const { isDriver, user, company } = res.locals;
        let targetUserId;
        if (isDriver) {
            targetUserId = user.id;
            res.locals.driver = await DriversService.getRecordByUserIdStrict(user.id);
        } else {
            const userId = req.params.driverIdOrId;
            targetUserId = userId;
            const driver = await DriversService.getRecordByUserId(userId);
            if (!driver) {
                return reject(res, ERRORS.DRIVERS.INVALID_DRIVER_ID);
            }
            res.locals.driver = driver;
        }
        const companyFromDb = await CompaniesService.getCompanyByUserId(targetUserId);
        if (!companyFromDb || companyFromDb.id !== company.id) {
            return reject(res, ERRORS.DRIVERS.INVALID_COMPANY);
        }
        next();
    } catch (error) {
        next(error);
    }
};

const injectNotRequiredUser = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (token) {
            const decodedData = TokenService.decodeJWToken(token);
            const userId = get(decodedData, 'id');

            if (isValidUUID(userId)) {
                const user = await UsersService.getUserForAuthentication(userId);
                if (user) {
                    res.locals.user = user;
                }
            }
        }

        return next();
    } catch (error) {
        next(error);
    }
};

const injectNotRequiredCompanyId = async (req, res, next) => {
    try {
        const { user } = res.locals;
        if (user) {
            const company = await CompaniesService.getCompanyByUserId(user.id);
            if (company) {
                res.locals.companyId = company.id;
            }
        }

        return next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    isHasPermissions,
    isAuthenticated,
    injectTargetRole,
    injectCompanyData,
    injectDriverData,
    injectNotRequiredUser,
    injectNotRequiredCompanyId,
};
