const { success, reject } = require('api/response');
const moment = require('moment');

// services
const PhoneConfirmationCodesService = require('services/tables/phone-confirmation-codes');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');

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

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

const confirmPhone = async (req, res, next) => {
    try {

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendCode,
    confirmPhone,
};
