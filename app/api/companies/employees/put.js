const { success, reject } = require('api/response');
const { isEmpty } = require('lodash');

// services
const UsersService = require('services/tables/users');
const FilesService = require('services/tables/files');
const DriversService = require('services/tables/drivers');
const UsersFilesService = require('services/tables/users-to-files');
const PhoneNumbersService = require('services/tables/phone-numbers');
const UsersCompaniesService = require('services/tables/users-to-companies');
const TableService = require('services/tables');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');

// formatters
const UsersFormatters = require('formatters/users');
const PhoneNumbersFormatters = require('formatters/phone-numbers');
const FilesFormatters = require('formatters/files');

const editEmployeeAdvanced = async (req, res, next) => {
    const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;
    try {
        const { company } = res.locals;
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

        if (!isEmpty(driversProps)) {
            transactionsList.push(
                DriversService.editDriverAsTransaction(targetUserId, driversProps)
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

        let filesToStore = [];
        const filesTypes = Object.keys(files);
        if (filesTypes.length) {
            const filesToDelete = await FilesService.getFilesByUserIdAndLabels(targetUserId, filesTypes);

            const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

            transactionsList.push(
                UsersFilesService.removeRecordsByFileIdsAsTransaction(ids)
            );
            transactionsList.push(
                FilesService.removeFilesByIdsAsTransaction(ids)
            );

            await Promise.all(urls.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));

            const [dbFiles, dbUsersFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForUsers(files, targetUserId);
            filesToStore = [...storageFiles];

            transactionsList.push(
                FilesService.addFilesAsTransaction(dbFiles)
            );
            transactionsList.push(
                UsersFilesService.addRecordsAsTransaction(dbUsersFiles)
            );
        }

        await TableService.runTransaction(transactionsList);

        if (filesToStore.length) {
            await Promise.all(filesToStore.map(({ bucket, path, data, contentType }) => {
                return S3Service.putObject(bucket, path, data, contentType);
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
