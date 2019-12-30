const uuid = require('uuid/v4');
const moment = require('moment');
const { isEmpty } = require('lodash');

const { success, reject } = require('api/response');

// services
const UsersService = require('services/tables/users');
const DriversService = require('services/tables/drivers');
const DraftDriversService = require('services/tables/draft-drivers');
const FilesService = require('services/tables/files');
const DraftFilesService = require('services/tables/draft-files');
const DraftDriversFilesService = require('services/tables/draft-drivers-to-files');
const UsersFilesService = require('services/tables/users-to-files');
const PhoneNumbersService = require('services/tables/phone-numbers');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const TablesService = require('services/tables');
const S3Service = require('services/aws/s3');
const MailService = require('services/mail');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { ROLES } = require('constants/system');

// formatters
const DriversFormatters = require('formatters/drivers');
const FilesFormatters = require('formatters/files');
const UsersFormatters = require('formatters/users');
const PhoneNumbersFormatters = require('formatters/phone-numbers');
const EmailConfirmationFormatters = require('formatters/email-confirmation');

const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;
const colsDraftDrivers = SQL_TABLES.DRAFT_DRIVERS.COLUMNS;
const colsPhoneNumbers = SQL_TABLES.PHONE_NUMBERS.COLUMNS;

const {
    INVITE_EXPIRATION_UNIT,
    INVITE_EXPIRATION_VALUE,
} = process.env;

const verifyDriver = async (req, res, next) => {
    try {
        const { driverId } = req.params;
        const currentUserId = res.locals.user.id;

        const [driver, draftDriver] = await Promise.all([
            DriversService.getRecordStrict(driverId),
            DraftDriversService.getRecordByDriverId(driverId),
        ]);

        const targetUserId = driver[colsDrivers.USER_ID];

        if (driver[colsDrivers.VERIFIED] && !draftDriver && !driver[colsDrivers.SHADOW]) {
            return reject(res, ERRORS.VERIFY.ALREADY_VERIFIED);
        }

        const transactionsList = [];
        let urlsToDelete = [];
        let driverData = {};
        if (!driver[colsDrivers.VERIFIED]) {
            driverData = DriversFormatters.formatRecordAsVerified();
        }
        let confirmationHash = '';

        if (!isEmpty(driverData)) {
            transactionsList.push(
                DriversService.editDriverAsTransaction(driverId, driverData)
            );
        }
        if (draftDriver) {
            if (driver[colsDrivers.SHADOW]) {
                confirmationHash = uuid();
                const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();
                const emailConfirmationData = EmailConfirmationFormatters.formatRecordToSave(targetUserId, confirmationHash, currentUserId, inviteExpirationDate);

                transactionsList.push(
                    EmailConfirmationService.addRecordAsTransaction(emailConfirmationData)
                );
            }
            const phoneNumber = draftDriver[colsDraftDrivers.NUMBER];
            const phonePrefixId = draftDriver[colsDraftDrivers.PHONE_PREFIX_ID];

            const busyPhoneNumber = await PhoneNumbersService.getRecordByNumberAndPrefixId(phoneNumber, phonePrefixId);
            if (busyPhoneNumber && busyPhoneNumber[colsPhoneNumbers.USER_ID] !== targetUserId) {
                return reject(res, ERRORS.PHONE_NUMBERS.BUSY);
            }

            const draftFiles = await DraftFilesService.getFilesByDraftDriverId(draftDriver.id);
            if (draftFiles.length) {
                const basicDraftLabels = FilesFormatters.formatBasicFileLabels(draftFiles);
                const filesToDelete = await FilesService.getFilesByDriverIdAndLabels(driverId, basicDraftLabels);
                if (filesToDelete.length) {
                    const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);
                    urlsToDelete = [...urls];

                    transactionsList.push(
                        UsersFilesService.removeRecordsByFileIdsAsTransaction(ids)
                    );
                    transactionsList.push(
                        FilesService.removeFilesByIdsAsTransaction(ids)
                    );
                }
                const [dbFiles, dbUsersFiles] = FilesFormatters.prepareFilesToStoreForUsersFromDraft(draftFiles, targetUserId);
                transactionsList.push(
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    UsersFilesService.addRecordsAsTransaction(dbUsersFiles)
                );
                const draftFilesIds = draftFiles.map(file => file.id);
                transactionsList.push(
                    DraftDriversFilesService.removeRecordsByFileIdsAsTransaction(draftFilesIds)
                );
                transactionsList.push(
                    DraftFilesService.removeFilesByIdsAsTransaction(draftFilesIds)
                );
            }

            const driverData = DriversFormatters.formatRecordToUpdateFromDraft(draftDriver);
            const usersData = UsersFormatters.formatUserToUpdateFromDraft(draftDriver);
            const phoneData = PhoneNumbersFormatters.formatPhoneNumberToUpdateFromDraft(draftDriver);

            transactionsList.push(
                UsersService.updateUserAsTransaction(targetUserId, usersData)
            );
            transactionsList.push(
                PhoneNumbersService.editRecordAsTransaction(targetUserId, phoneData)
            );
            transactionsList.push(
                DriversService.editDriverByUserIdAsTransaction(targetUserId, driverData)
            );

            transactionsList.push(
                DraftDriversService.removeRecordAsTransaction(draftDriver.id)
            );
        }

        await TablesService.runTransaction(transactionsList);

        if (draftDriver && driver[colsDrivers.SHADOW]) {
            const email = draftDriver[colsDraftDrivers.EMAIL];
            await MailService.sendConfirmationEmail(email, confirmationHash, ROLES.DRIVER);
        }

        if (urlsToDelete.length) {
            await Promise.all(urlsToDelete.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));
        }

        return success(res, { driverId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyDriver,
};
