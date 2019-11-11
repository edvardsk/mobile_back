const { success, reject } = require('api/response');
const { get } = require('lodash');

// services
const UsersService = require('services/tables/users');
const CryptService = require('services/crypto');
const TokenService = require('services/token');
const RolesPermissionsService = require('services/tables/roles-to-permissions');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { ERROR_CODES } = require('constants/http-codes');
const { PERMISSIONS } = require('constants/system');

// helpers
const { isManagementRole } = require('helpers');

const colsUsers = SQL_TABLES.USERS.COLUMNS;

const checkUserExisting = async (req, res, next) => {
    try {
        const email = get(req.body, 'email');

        const user = await UsersService.getUserByEmailWithRole(email);

        if (!user) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_EMAIL_OR_PASSWORD, {}, ERROR_CODES.UNAUTHORIZED);
        }

        res.locals.user = user;
        return next();
    } catch (error) {
        next(error);
    }
};

const checkManagementRole = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const userRole = user[HOMELESS_COLUMNS.ROLE];
        if (!isManagementRole(userRole)) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_EMAIL_OR_PASSWORD, {}, ERROR_CODES.UNAUTHORIZED);
        }
        return next();
    } catch (error) {
        next(error);
    }
};

const checkNotManagementRole = async (req, res, next) => {
    try {
        const { user } = res.locals;
        const userRole = user[HOMELESS_COLUMNS.ROLE];
        if (isManagementRole(userRole)) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_EMAIL_OR_PASSWORD, {}, ERROR_CODES.UNAUTHORIZED);
        }
        return next();
    } catch (error) {
        next(error);
    }
};

const generateToken = async (req, res, next) => {
    try {
        const password = get(req.body, 'password');

        const { user } = res.locals;
        if (user[colsUsers.FREEZED]) {
            return reject(res, ERRORS.AUTHORIZATION.FREEZED, {}, ERROR_CODES.FORBIDDEN);
        }

        const { hash } = await CryptService.hashPassword(password, user[colsUsers.KEY]);
        if (hash === user[colsUsers.PASSWORD]) {

            const permissions = await RolesPermissionsService.getUserPermissions(user.id);
            if (!permissions.includes(PERMISSIONS.AUTHORIZATION)) {
                return reject(res, ERRORS.AUTHORIZATION.UNCONFIRMED_EMAIL, { email: user[colsUsers.EMAIL] }, ERROR_CODES.FORBIDDEN);
            } else {
                const token = await TokenService.getJWToken(user.id);
                return success(res, { token });
            }
        } else {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_EMAIL_OR_PASSWORD, {}, ERROR_CODES.UNAUTHORIZED);
        }
    } catch (error) {
        next(error);
    }
};



module.exports = {
    checkUserExisting,
    checkManagementRole,
    checkNotManagementRole,
    generateToken,
};
