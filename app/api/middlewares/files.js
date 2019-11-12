const multer  = require('multer');
const { groupBy, isEmpty } = require('lodash');
const { success, reject } = require('api/response');

// services
const FilesService = require('services/tables/files');
const UsersService = require('services/tables/users');
const CompaniesService = require('services/tables/companies');
const OtherOrganizationsService = require('services/tables/other-organizations');
const CompaniesFilesService = require('services/tables/companies-to-files');
const TablesService = require('services/tables');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SUCCESS_CODES } = require('constants/http-codes');
const { ERRORS } = require('constants/errors');

// formatters
const { prepareFilesToDelete, prepareFilesToStoreForCompanies } = require('formatters/files');

const { REQUEST_FILES_COUNT } = process.env;

const formDataHandler = (handler) => (req, res, next) => handler(req, res, (error) => {
    if (error instanceof multer.MulterError) {
        logger.error(error);
        return reject(res, ERRORS.FILES.UPLOADING_ERROR, error);
    } else if (error) {
        next(error);
    } else if (req.files.length > +REQUEST_FILES_COUNT) {
        return reject(res, ERRORS.FILES.TOO_MUCH_FILES);
    } else {
        req.files = groupBy(req.files, 'fieldname');
        next();
    }
});

const createOrUpdateDataOnStep3 = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
    const colsOtherOrganizations = SQL_TABLES.OTHER_ORGANIZATIONS.COLUMNS;
    try {
        const { body, files } = req;
        const { step3Data } = res.locals;
        const { transactionList, companyHeadId, isEditOperation } = step3Data;

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

        const company = await CompaniesService.getCompanyByUserIdStrict(companyHeadId);

        const [dbFiles, dbCompaniesFiles, storageFiles] = prepareFilesToStoreForCompanies(files, company.id);

        let filesToDelete;
        if (isEditOperation) {
            const labelsToDelete = Object.keys(files);
            if (labelsToDelete.length) {
                filesToDelete = await FilesService.getFilesByCompanyIdAndLabels(company.id, labelsToDelete);
            } else {
                filesToDelete = [];
            }
        } else {
            filesToDelete = await FilesService.getFilesByCompanyId(company.id);
        }

        if (filesToDelete.length) {
            // delete old files

            const [ids, urls] = prepareFilesToDelete(filesToDelete);

            transactionList.push(
                CompaniesFilesService.removeRecordsByFileIdsAsTransaction(ids)
            );
            transactionList.push(
                FilesService.removeFilesByIdsAsTransaction(ids)
            );

            await Promise.all(urls.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));
        }

        if (dbFiles.length) {
            transactionList.push(
                FilesService.addFilesAsTransaction(dbFiles)
            );
            transactionList.push(
                CompaniesFilesService.addRecordsAsTransaction(dbCompaniesFiles)
            );
        }

        transactionList.push(
            OtherOrganizationsService.removeRecordsByCompanyIdAsTransaction(company.id)
        );

        if (!isEmpty(usersProps)) {
            transactionList.push(UsersService.updateUserAsTransaction(companyHeadId, usersProps));
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

module.exports = {
    formDataHandler,
    createOrUpdateDataOnStep3,
};
