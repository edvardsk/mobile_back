const { success, reject } = require('api/response');
const { get } = require('lodash');

// services
const UsersService = require('services/tables/users');
const CryptService = require('services/crypto');
const TokenService = require('services/token');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { ERROR_CODES } = require('constants/http-codes');

const colsUsers = SQL_TABLES.USERS.COLUMNS;

const checkUserExisting = async (req, res, next) => {
    try {
        const name = get(req.body, 'name');

        const user = await UsersService.getUserByName(name);

        if (!user) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_NAME_OR_PASSWORD, {}, ERROR_CODES.UNAUTHORIZED);
        }

        res.locals.user = user;
        return next();
    } catch (error) {
        next(error);
    }
};

const generateToken = async (req, res, next) => {
    try {
        const password = get(req.body, 'password');

        const { user } = res.locals;

        const { hash } = await CryptService.hashPassword(password, user[colsUsers.KEY]);

        if (hash === user[colsUsers.PASSWORD]) {
            const token = await TokenService.getJWToken(user.id);
            return success(res, { token });
        } else {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_DATA, {}, ERROR_CODES.UNAUTHORIZED);
        }
    } catch (error) {
        next(error);
    }
};



module.exports = {
    checkUserExisting,
    generateToken,
};
