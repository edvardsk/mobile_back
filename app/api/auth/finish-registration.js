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
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: FinishRegistrationFormatters.formatCompanyForIndividualForwarderToSave,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: FinishRegistrationFormatters.formatCompanyForSoleProprietorForwarderToSave,
};

const MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_1 = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: PERMISSIONS.REGISTRATION_SAVE_STEP_2,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_2,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_3,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_2,
};

const finishRegistrationStep1 = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const userPermissions = res.locals.permissions;

        let transactionList = [];
        if (userPermissions.includes(PERMISSIONS.REGISTRATION_SAVE_STEP_2) || userPermissions.includes(PERMISSIONS.REGISTRATION_SAVE_STEP_3)) {
            // update data
            const companyData = {
                ...req.body,
            };

            const company = await CompaniesService.getCompanyByUserIdStrict(userId);

            transactionList = [
                ...transactionList,
                CompaniesService.updateCompanyAsTransaction(company.id, MAP_ROLES_AND_FORMATTERS_STEP_1[userRole](companyData)),
            ];
        } else {
            // insert data
            const companyId = uuid();

            const companyData = {
                ...req.body,
                id: companyId,
            };

            transactionList = [
                ...transactionList,
                CompaniesService.addCompanyAsTransaction(companyData),
                UserPermissionsService.addUserPermissionAsTransaction(userId, MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_1[userRole]),
                UsersCompaniesService.addRecordAsTransaction(UsersCompaniesFormatters.formatRecordToSave(userId, companyId)),
            ];
        }

        await TablesService.runTransaction(transactionList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const finishRegistrationStep2 = async (req, res, next) => {
    try {
        const { body } = req;
        const userId = res.locals.user.id;
        const userPermissions = res.locals.permissions;

        const company = await CompaniesService.getCompanyByUserIdStrict(userId);
        let transactionList = [
            CompaniesService.updateCompanyAsTransaction(company.id, body),
        ];

        if (!userPermissions.includes(PERMISSIONS.REGISTRATION_SAVE_STEP_3)) {
            transactionList = [
                ...transactionList,
                UserPermissionsService.addUserPermissionAsTransaction(userId, PERMISSIONS.REGISTRATION_SAVE_STEP_3),
            ];
        }

        await TablesService.runTransaction(transactionList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    finishRegistrationStep1,
    finishRegistrationStep2,
};
