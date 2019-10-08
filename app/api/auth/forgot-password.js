const { success, reject } = require('api/response');
const uuid = require('uuid/v4');

// services
const ForgotPasswordService = require('services/tables/forgot-password');
const UsersService = require('services/tables/users');
const RolesPermissionsService = require('services/tables/roles-to-permissions');
const MailService = require('services/mail');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { PERMISSIONS } = require('constants/system');

// helpers
const { isValidEmail, isStrongEnoughPassword } = require('helpers/validators');

// formatters
const { formatRecordToSave } = require('formatters/forgot-password');

const resetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!isValidEmail(email)) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_EMAIL_FORMAT);
        }

        const user = await UsersService.getUserByEmail(email);

        if (user) {
            const { id } = user;

            const permissions = await RolesPermissionsService.getUserPermissions(user.id);
            if (permissions.includes(PERMISSIONS.RESET_PASSWORD)) {
                const hash = uuid();
                await Promise.all([
                    MailService.sendResetPasswordEmail(email, hash),
                    ForgotPasswordService.addSession(formatRecordToSave(id, hash)),
                ]);
            }
        }
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    const colsForgotPassword = SQL_TABLES.FORGOT_PASSWORD.COLUMNS;
    try {
        const { hash } = req.query;
        const { password } = req.body;
        if (!hash) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_HASH);
        }

        const passwordValidationErrors = isStrongEnoughPassword(password);
        if (passwordValidationErrors) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_PASSWORD_FORMAT, passwordValidationErrors);
        }

        const hashFromDb = await ForgotPasswordService.getRecordByHash(hash);
        if (!hashFromDb) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_HASH);
        }

        const userId = hashFromDb[colsForgotPassword.USER_ID];

        const latestActiveSession = await ForgotPasswordService.getLatestActiveSessionByUserId(userId);

        if (hashFromDb[colsForgotPassword.HASH] !== latestActiveSession[colsForgotPassword.HASH]) {
            return reject(res, ERRORS.AUTHORIZATION.INVALID_HASH);
        }

        await ForgotPasswordService.changePassword(userId, password);

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    resetPassword,
    changePassword,
};
