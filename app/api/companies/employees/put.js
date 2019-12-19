const { isEmpty } = require('lodash');
const uuid = require('uuid/v4');
const moment = require('moment');

const { success, reject } = require('api/response');

// services
const UsersService = require('services/tables/users');
const FilesService = require('services/tables/files');
const DraftFilesService = require('services/tables/draft-files');
const DriversService = require('services/tables/drivers');
const DraftDriversService = require('services/tables/draft-drivers');
const DraftDriversFilesService = require('services/tables/draft-drivers-to-files');
const UsersFilesService = require('services/tables/users-to-files');
const PhoneNumbersService = require('services/tables/phone-numbers');
const UsersCompaniesService = require('services/tables/users-to-companies');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const TableService = require('services/tables');
const S3Service = require('services/aws/s3');
const MailService = require('services/mail');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { ROLES } = require('constants/system');
const { DOCUMENTS } = require('constants/files');

// formatters
const UsersFormatters = require('formatters/users');
const PhoneNumbersFormatters = require('formatters/phone-numbers');
const FilesFormatters = require('formatters/files');
const DraftDriversFormatters = require('formatters/draft-drivers');
const EmailConfirmationFormatters = require('formatters/email-confirmation');

// helpers
const { validateVisasDates } = require('helpers/validators/files');

const {
    INVITE_EXPIRATION_UNIT,
    INVITE_EXPIRATION_VALUE,
} = process.env;

const colsUsers = SQL_TABLES.USERS.COLUMNS;

// use this route only for drivers
// todo: rename to EDIT DRIVERS
const editEmployeeAdvanced = async (req, res, next) => {
    const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;
    try {
        const { company, isControlRole } = res.locals;
        const currentUserId = res.locals.user.id;
        const targetUserId = req.params.userId;
        const { files, body } = req;

        const isFromOneCompany = await UsersCompaniesService.hasCompanyUser(company.id, targetUserId);
        if (!isFromOneCompany) {
            return reject(res, ERRORS.COMPANIES.NOT_USER_IN_COMPANY);
        }

        const transactionsList = [];

        const DRIVERS_PROPS = new Set([
            colsDrivers.DRIVER_LICENCE_REGISTERED_AT,
            colsDrivers.DRIVER_LICENCE_EXPIRED_AT,
        ]);

        const driversProps = {};

        Object.keys(body).forEach(key => {
            if (DRIVERS_PROPS.has(key)) {
                driversProps[key] = body[key];
            }
        });
        let filesToStore = [];
        let urlsToDelete = [];
        const labels = Object.keys(files);

        const labelsArr = FilesFormatters.formatBasicFileLabelsFromTypes(labels);

        const errors = validateVisasDates(labelsArr, body);
        if (errors.length) {
            return reject(res, ERRORS.INVITES.SKIPPED_DATES);
        }

        const driver = await DriversService.getRecordByUserIdStrict(targetUserId);
        const isShadow = driver[colsDrivers.SHADOW];
        if (isShadow && (!files[DOCUMENTS.PASSPORT] || !files[DOCUMENTS.DRIVER_LICENSE])) {
            return reject(res, ERRORS.INVITES.SKIPPED_REQUIRED_FILES);
        }

        if (isControlRole || isEmpty(driversProps)) { // save data directly if executed by admin or not for driver
            if (!isEmpty(driversProps)) {
                transactionsList.push(
                    DriversService.editDriverByUserIdAsTransaction(targetUserId, {
                        ...driversProps,
                        [colsDrivers.VERIFIED]: true,
                        [colsDrivers.SHADOW]: false,
                    })
                );
            }

            const usersData = UsersFormatters.formatUserToUpdate(body);
            const phoneData = PhoneNumbersFormatters.formatPhoneNumberToUpdate(body);

            transactionsList.push(
                UsersService.updateUserAsTransaction(targetUserId, usersData)
            );
            transactionsList.push(
                PhoneNumbersService.editRecordAsTransaction(targetUserId, phoneData)
            );

            const filesTypes = Object.keys(files);
            if (filesTypes.length) {
                const fileLabels = FilesFormatters.formatBasicFileLabelsFromTypes(filesTypes);
                const filesToDelete = await FilesService.getFilesByUserIdAndLabels(targetUserId, fileLabels);
                if (filesToDelete.length) {
                    const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                    transactionsList.push(
                        UsersFilesService.removeRecordsByFileIdsAsTransaction(ids)
                    );
                    transactionsList.push(
                        FilesService.removeFilesByIdsAsTransaction(ids)
                    );

                    urlsToDelete = [
                        ...urlsToDelete,
                        ...urls,
                    ];
                }

                const [dbFiles, dbUsersFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForUsers(files, targetUserId, body);
                filesToStore = [...storageFiles];

                transactionsList.push(
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    UsersFilesService.addRecordsAsTransaction(dbUsersFiles)
                );
            }
        } else {
            const userFromDb = await UsersService.getUserWithDraftDriverStrict(targetUserId);

            const driverId = userFromDb[HOMELESS_COLUMNS.DRIVER_ID];
            const draftDriverId = userFromDb[HOMELESS_COLUMNS.DRAFT_DRIVER_ID];

            let newDraftDriverId;
            if (draftDriverId) {
                const draftDriver = DraftDriversFormatters.formatRecordToEdit(body);
                transactionsList.push(
                    DraftDriversService.editRecordAsTransaction(draftDriverId, draftDriver)
                );
            } else {
                newDraftDriverId = uuid();
                const draftDriver = DraftDriversFormatters.formatRecordToSave(newDraftDriverId, driverId, body);
                transactionsList.push(
                    DraftDriversService.addRecordAsTransaction(draftDriver)
                );
            }

            const filesTypes = Object.keys(files);
            if (filesTypes.length) {
                if (draftDriverId) {
                    const fileLabels = FilesFormatters.formatBasicFileLabelsFromTypes(filesTypes);
                    const filesToDelete = await DraftFilesService.getFilesByDraftDriverIdAndLabels(draftDriverId, fileLabels);

                    if (filesToDelete.length) {
                        const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                        transactionsList.push(
                            DraftDriversFilesService.removeRecordsByFileIdsAsTransaction(ids)
                        );
                        transactionsList.push(
                            DraftFilesService.removeFilesByIdsAsTransaction(ids)
                        );

                        urlsToDelete = [
                            ...urlsToDelete,
                            ...urls,
                        ];
                    }
                }

                const [
                    dbFiles, dbDraftDriversFiles, storageFiles
                ] = FilesFormatters.prepareFilesToStoreForDraftDrivers(files, newDraftDriverId || draftDriverId, body);
                filesToStore = [...storageFiles];

                transactionsList.push(
                    DraftFilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    DraftDriversFilesService.addRecordsAsTransaction(dbDraftDriversFiles)
                );
            }
        }

        let confirmationHash = '';
        if (isControlRole && isShadow) {
            confirmationHash = uuid();
            const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();
            const emailConfirmationData = EmailConfirmationFormatters.formatRecordToSave(targetUserId, confirmationHash, currentUserId, inviteExpirationDate);
            transactionsList.push(
                EmailConfirmationService.addRecordAsTransaction(emailConfirmationData),
            );
        }

        await TableService.runTransaction(transactionsList);

        if (isControlRole && isShadow) {
            const email = body[colsUsers.EMAIL];
            await MailService.sendConfirmationEmail(email, confirmationHash, ROLES.DRIVER);
        }

        if (filesToStore.length) {
            await Promise.all(filesToStore.map(({ bucket, path, data, contentType }) => {
                return S3Service.putObject(bucket, path, data, contentType);
            }));
        }

        if (urlsToDelete.length) {
            await Promise.all(urlsToDelete.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));
        }

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editEmployeeAdvanced,
};
