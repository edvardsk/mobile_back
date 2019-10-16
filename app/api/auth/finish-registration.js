const { success } = require('api/response');
const uuid = require('uuid/v4');

// services
const CryptService = require('services/crypto');
const FilesService = require('services/tables/files');
const UsersService = require('services/tables/users');
const FileLabelsService = require('services/tables/file-labels');
const FilesLabelsService = require('services/tables/files-to-labels');
const UsersFilesService = require('services/tables/users-to-files');
const CompaniesService = require('services/tables/companies');
const UsersCompaniesService = require('services/tables/users-to-companies');
const PhoneConfirmationCodesService = require('services/tables/phone-confirmation-codes');
const UserRolesService = require('services/tables/users-to-roles');
const UserPermissionsService = require('services/tables/users-to-permissions');
const TablesService = require('services/tables');
const UsersRolesService = require('services/tables/users-to-roles');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ROLES, PERMISSIONS } = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
const UsersCompaniesFormatters = require('formatters/users-to-companies');
const FinishRegistrationFormatters = require('formatters/finish-registration');

const { AWS_S3_BUCKET_NAME } = process.env;

const MAP_ROLES_AND_FORMATTERS_STEP_1 = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: FinishRegistrationFormatters.formatCompanyForTransporterToSave,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: FinishRegistrationFormatters.formatCompanyForHolderToSave,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_FORWARDER]: FinishRegistrationFormatters.formatCompanyForForwarderToSave,
};

const finishRegistrationStep1 = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    try {
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const userPermissions = res.locals.permissions;

        if (userPermissions.includes(PERMISSIONS.REGISTRATION_SAVE_STEP_2)) {
            // update data
            const companyData = {
                ...req.body,
            };
            const userData = {};

            let transactionList = [];

            const company = await CompaniesService.getCompanyByUserId(userId);

            if (userRole === ROLES.CONFIRMED_EMAIL_AND_PHONE_FORWARDER) {
                userData[colsUsers.FULL_NAME] = companyData[colsUsers.FULL_NAME];
                transactionList.push(UsersService.updateUserAsTransaction(userId, userData));
            }

            transactionList = [
                ...transactionList,
                CompaniesService.updateCompanyAsTransaction(company.id, MAP_ROLES_AND_FORMATTERS_STEP_1[userRole](companyData)),
            ];

            await TablesService.runTransaction(transactionList);
        } else {
            // insert data
            const companyId = uuid();

            const companyData = {
                ...req.body,
                id: companyId,
            };
            const userData = {};

            let transactionList = [];

            if (userRole === ROLES.CONFIRMED_EMAIL_AND_PHONE_FORWARDER) {
                userData[colsUsers.FULL_NAME] = companyData[colsUsers.FULL_NAME];
                delete companyData[colsUsers.FULL_NAME];
                transactionList.push(UsersService.updateUserAsTransaction(userId, userData));
            }

            transactionList = [
                ...transactionList,
                CompaniesService.addCompanyAsTransaction(companyData),
                UserPermissionsService.addUserPermissionAsTransaction(userId, PERMISSIONS.REGISTRATION_SAVE_STEP_2),
                UsersCompaniesService.addRecordAsTransaction(UsersCompaniesFormatters.formatRecordToSave(userId, companyId)),
            ];

            await TablesService.runTransaction(transactionList);
        }

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    finishRegistrationStep1,
};
