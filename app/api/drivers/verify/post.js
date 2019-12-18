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
const TablesService = require('services/tables');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');

// formatters
const DriversFormatters = require('formatters/drivers');
const FilesFormatters = require('formatters/files');
const UsersFormatters = require('formatters/users');
const PhoneNumbersFormatters = require('formatters/phone-numbers');

const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;
const colsDraftDrivers = SQL_TABLES.DRAFT_DRIVERS.COLUMNS;
const colsPhoneNumbers = SQL_TABLES.PHONE_NUMBERS.COLUMNS;

const verifyDriver = async (req, res, next) => {
    try {
        const { driverId } = req.params;

        const [driver, draftDriver] = await Promise.all([
            DriversService.getRecordStrict(driverId),
            DraftDriversService.getRecordByDriverId(driverId),
        ]);

        const targetUserId = driver[colsDrivers.USER_ID];

        if (driver[colsDrivers.VERIFIED] && !draftDriver) {
            return reject(res, ERRORS.VERIFY.ALREADY_VERIFIED);
        }

        const transactionsList = [];
        let urlsToDelete = [];
        if (!driver[colsDrivers.VERIFIED]) {
            transactionsList.push(
                DriversService.editDriverAsTransaction(driverId, DriversFormatters.formatRecordAsVerified()),
            );
        }
        if (draftDriver) {
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
