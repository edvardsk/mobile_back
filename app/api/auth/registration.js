const { success, reject } = require('api/response');
const uuid = require('uuid/v4');

// services
const UsersService = require('services/tables/users');
const CryptService = require('services/crypto');
const TableService = require('services/tables');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
const { formatUserForSaving } = require('formatters/users');

const createUser = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;

    try {
        const { body } = req;
        const name = body[colsUsers.NAME];

        const userByName = await UsersService.getUserByName(name);
        if (userByName) {
            return reject(res, ERRORS.REGISTRATION.DUPLICATE_USER);
        }

        const password = body[colsUsers.PASSWORD];
        const { hash, key } = await CryptService.hashPassword(password);

        const userId = uuid();

        const data = formatUserForSaving(userId, body, hash, key);

        await TableService.runTransaction([
            UsersService.addUserAsTransaction(data),
        ]);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
};
