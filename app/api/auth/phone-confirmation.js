const { success, reject } = require('api/response');
const moment = require('moment');

// services
const PhoneConfirmationCodesService = require('services/tables/phone-confirmation-codes');
const UserRolesService = require('services/tables/users-to-roles');
const UserPermissionsService = require('services/tables/users-to-permissions');
const TablesService = require('services/tables');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const {
    MAP_FROM_CONFIRMED_EMAIL_TO_CONFIRMED_PHONE,
    MAP_FROM_PENDING_ROLE_TO_MAIN,
    PERMISSIONS,
} = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');

// helpers
const { nextAllowedRequestForSendingCode } = require('helpers/phone-confirmation');

const {
    PHONE_CONFIRMATION_NEXT_REQUEST_UNIT,
} = process.env;

const sendCode = async (req, res, next) => {
    const cols = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;
    try {
        const userId = res.locals.user.id;

        const recordsCount = await PhoneConfirmationCodesService.getRecordsCount(userId);

        if (!recordsCount) {
            await PhoneConfirmationCodesService.prepareAndSaveRecord(userId);
        } else {
            const seconds = nextAllowedRequestForSendingCode(recordsCount);
            const latestRecord = await PhoneConfirmationCodesService.getLatestRecord(userId);
            const momentLatestRecord = moment(latestRecord[cols.CREATED_AT]);
            const momentAllowedTimeForNextRecord = momentLatestRecord.add(seconds, PHONE_CONFIRMATION_NEXT_REQUEST_UNIT);
            if (moment() < momentAllowedTimeForNextRecord) {
                return reject(res, ERRORS.PHONE_CONFIRMATION.TOO_OFTEN, {
                    nextTryTime: momentAllowedTimeForNextRecord.toISOString()
                });
            }
            await PhoneConfirmationCodesService.prepareAndSaveRecord(userId);
        }

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const confirmPhone = async (req, res, next) => {
    const cols = SQL_TABLES.PHONE_CONFIRMATION_CODES.COLUMNS;
    try {
        const userId = res.locals.user.id;
        const { role } = res.locals.user;
        // const { code } = req.body; // todo: use after integrating sms service

        const latestRecord = await PhoneConfirmationCodesService.getLatestRecord(userId);
        if (!latestRecord) {
            return reject(res, ERRORS.PHONE_CONFIRMATION.INVALID_CODE);
        }

        if (moment() > moment(latestRecord[cols.EXPIRED_AT])) {
            return reject(res, ERRORS.PHONE_CONFIRMATION.CODE_HAS_EXPIRED);
        }

        // if (latestRecord[cols.CODE] !== code) { // todo: use after integrating sms service
        //     return reject(res, ERRORS.PHONE_CONFIRMATION.INVALID_CODE);
        // }

        const futureRole = MAP_FROM_CONFIRMED_EMAIL_TO_CONFIRMED_PHONE[role];

        let transactionsList = [];
        const mustContinueRegistration = MAP_FROM_PENDING_ROLE_TO_MAIN[futureRole];
        if (mustContinueRegistration) {
            transactionsList.push(UserPermissionsService.addUserPermissionAsTransaction(userId, PERMISSIONS.REGISTRATION_SAVE_STEP_1));
        }

        transactionsList.push(UserRolesService.updateUserRoleAsTransaction(userId, futureRole));

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendCode,
    confirmPhone,
};
