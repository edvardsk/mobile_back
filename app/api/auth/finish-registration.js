const { success } = require('api/response');
const uuid = require('uuid/v4');
const { isEmpty } = require('lodash');

// services
const CryptService = require('services/crypto');
const FilesService = require('services/tables/files');
const UsersService = require('services/tables/users');
const CompaniesService = require('services/tables/companies');
const RoutesService = require('services/tables/routes');
const OtherOrganizationsService = require('services/tables/other-organizations');
const CompaniesFilesService = require('services/tables/companies-to-files');
const UserPermissionsService = require('services/tables/users-to-permissions');
const TablesService = require('services/tables');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ROLES, PERMISSIONS } = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
const FinishRegistrationFormatters = require('formatters/finish-registration');
const { formatStoringFile } = require('formatters/files');
const { formatGeoDataValuesToSave } = require('formatters/geo');
const { formatRoutesToSave } = require('formatters/routes');
const { formatCompanyDataOnStep2 } = require('formatters/companies');

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

const MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_3 = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: PERMISSIONS.REGISTRATION_SAVE_STEP_4,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_5,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_5,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: PERMISSIONS.REGISTRATION_SAVE_STEP_5,
};

const finishRegistrationStep1 = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;

        const company = await CompaniesService.getCompanyByUserIdStrict(userId);

        const companyData = {
            ...req.body,
        };

        const transactionList = [
            CompaniesService.updateCompanyAsTransaction(company.id, MAP_ROLES_AND_FORMATTERS_STEP_1[userRole](companyData)),
            UserPermissionsService.addUserPermissionAsTransaction(userId, MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_1[userRole]),
        ];

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

        const companyData = formatCompanyDataOnStep2(body);

        const transactionList = [
            CompaniesService.updateCompanyAsTransaction(company.id, companyData),
        ];

        if (!userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_3)) {
            transactionList.push(UserPermissionsService.addUserPermissionAsTransaction(userId, PERMISSIONS.REGISTRATION_SAVE_STEP_3));
        }
        await TablesService.runTransaction(transactionList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const finishRegistrationStep3 = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
    const colsFiles = SQL_TABLES.FILES.COLUMNS;
    const colsCompaniesFiles = SQL_TABLES.COMPANIES_TO_FILES.COLUMNS;
    const colsOtherOrganizations = SQL_TABLES.OTHER_ORGANIZATIONS.COLUMNS;
    try {
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const userPermissions = res.locals.permissions;
        const { body, files } = req;

        const USER_PROPS = new Set([
            colsUsers.PASSPORT_NUMBER,
            colsUsers.PASSPORT_ISSUING_AUTHORITY,
            colsUsers.PASSPORT_CREATED_AT,
            colsUsers.PASSPORT_EXPIRED_AT
        ]);

        const COMPANY_PROPS = new Set([
            colsCompanies.STATE_REGISTRATION_CERTIFICATE_NUMBER,
            colsCompanies.STATE_REGISTRATION_CERTIFICATE_CREATED_AT,
            colsCompanies.INSURANCE_POLICY_NUMBER,
            colsCompanies.INSURANCE_POLICY_CREATED_AT,
            colsCompanies.INSURANCE_POLICY_EXPIRED_AT,
            colsCompanies.INSURANCE_COMPANY_NAME,
            colsCompanies.RESIDENCY_CERTIFICATE_CREATED_AT,
            colsCompanies.RESIDENCY_CERTIFICATE_EXPIRED_AT,
        ]);

        const usersProps = {};
        const companiesProps = {};
        Object.keys(body).forEach(key => {
            if (USER_PROPS.has(key)) {
                usersProps[key] = body[key];
            } else if (COMPANY_PROPS.has(key)) {
                companiesProps[key] = body[key];
            }
        });

        const company = await CompaniesService.getCompanyByUserIdStrict(userId);

        const dataToStore = Object.keys(files).reduce((acc, type) => {
            const [dbFiles, dbCompaniesFiles, storageFiles] = acc;
            files[type].forEach(file => {
                const fileId = uuid();
                const fileHash = uuid();
                const filePath = `${fileHash}${file.originalname}`;
                const fileUrl = formatStoringFile(AWS_S3_BUCKET_NAME, filePath);
                dbFiles.push({
                    id: fileId,
                    [colsFiles.NAME]: file.originalname,
                    [colsFiles.TYPE]: type,
                    [colsFiles.URL]: CryptService.encrypt(fileUrl),
                });
                dbCompaniesFiles.push({
                    [colsCompaniesFiles.COMPANY_ID]: company.id,
                    [colsCompaniesFiles.FILE_ID]: fileId,
                });
                storageFiles.push({
                    bucket: AWS_S3_BUCKET_NAME,
                    path: filePath,
                    data: file.buffer,
                    contentType: file.mimetype,
                });
            });
            return acc;
        }, [[], [], []]);

        const [dbFiles, dbCompaniesFiles, storageFiles] = dataToStore;

        let transactionList = [];
        if (userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_4) || userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_5)) {
            // update data

            const companyFiles = await CompaniesFilesService.getFilesByCompanyId(company.id);

            const [ids, urls] = companyFiles.reduce((acc, file) => {
                const [ids, urls] = acc;
                ids.push(file.id);
                urls.push(CryptService.decrypt(file[colsFiles.URL]));
                return acc;

            }, [[], []]);

            const deleteTransactionList = [
                CompaniesFilesService.removeRecordsByCompanyIdAsTransaction(company.id),
                OtherOrganizationsService.removeRecordsByCompanyIdAsTransaction(company.id),
            ];

            if (ids.length) {
                deleteTransactionList.push( FilesService.removeFilesByIdsAsTransaction(ids));
            }

            await TablesService.runTransaction(deleteTransactionList);

            await Promise.all(urls.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));

            transactionList = [
                FilesService.addFilesAsTransaction(dbFiles),
                CompaniesFilesService.addRecordsAsTransaction(dbCompaniesFiles),
            ];
        } else {
            // insert data

            transactionList = [
                FilesService.addFilesAsTransaction(dbFiles),
                CompaniesFilesService.addRecordsAsTransaction(dbCompaniesFiles),
                UserPermissionsService.addUserPermissionAsTransaction(userId, MAP_ROLES_TO_NEXT_PERMISSIONS_FOR_STEP_3[userRole]),
            ];
        }

        if (!isEmpty(usersProps)) {
            transactionList.push(UsersService.updateUserAsTransaction(userId, usersProps));
        }

        if (!isEmpty(companiesProps)) {
            transactionList.push(CompaniesService.updateCompanyAsTransaction(company.id, companiesProps));
        }

        const otherOrganizations = body[HOMELESS_COLUMNS.OTHER_ORGANIZATIONS];
        if (Array.isArray(otherOrganizations)) {
            const otherOrganizationWithCompanyId = otherOrganizations.map(organization => ({
                ...organization,
                [colsOtherOrganizations.COMPANY_ID]: company.id,
            }));
            transactionList.push(OtherOrganizationsService.addRecordsAsTransaction(otherOrganizationWithCompanyId));
        }

        await TablesService.runTransaction(transactionList);
        await Promise.all(storageFiles.map(({ bucket, path, data, contentType }) => {
            return S3Service.putObject(bucket, path, data, contentType);
        }));

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const finishRegistrationStep4 = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const userPermissions = res.locals.permissions;
        const { body } = req;
        const coordinates = formatGeoDataValuesToSave(body.routes);

        const company = await CompaniesService.getCompanyByUserIdStrict(userId);

        const routes = formatRoutesToSave(coordinates, company.id);

        const transactionsList = [];
        if (userPermissions.has(PERMISSIONS.REGISTRATION_SAVE_STEP_5)) {
            // update
            transactionsList.push(RoutesService.removeRecordsByCompanyIdAsTransaction(company.id));
        } else {
            // insert
            transactionsList.push(UserPermissionsService.addUserPermissionAsTransaction(userId, PERMISSIONS.REGISTRATION_SAVE_STEP_5));
        }

        transactionsList.push(RoutesService.addRecordsAsTransaction(routes));

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const finishRegistrationStep5 = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const permissionsToRemove = [
            PERMISSIONS.REGISTRATION_SAVE_STEP_1,
            PERMISSIONS.REGISTRATION_SAVE_STEP_2,
            PERMISSIONS.REGISTRATION_SAVE_STEP_3,
            PERMISSIONS.REGISTRATION_SAVE_STEP_4,
            PERMISSIONS.REGISTRATION_SAVE_STEP_5,
        ];

        const transactionsList = [
            UserPermissionsService.removeUserPermissionsAsTransaction(userId, permissionsToRemove),
            UserPermissionsService.addUserPermissionAsTransaction(userId, PERMISSIONS.EXPECT_REGISTRATION_CONFIRMATION),
        ];

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    finishRegistrationStep1,
    finishRegistrationStep2,
    finishRegistrationStep3,
    finishRegistrationStep4,
    finishRegistrationStep5,
};
