const multer  = require('multer');
const uuid = require('uuid/v4');
const { groupBy, isEmpty } = require('lodash');
const { success, reject } = require('api/response');

// services
const CryptService = require('services/crypto');
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
const { DOCUMENTS_SET, FILES_GROUPS } = require('constants/files');
const { SqlArray } = require('constants/instances');

// formatters
const { formatStoringFile } = require('formatters/files');

const { AWS_S3_BUCKET_NAME, REQUEST_FILES_COUNT } = process.env;

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
    const colsFiles = SQL_TABLES.FILES.COLUMNS;
    const colsCompaniesFiles = SQL_TABLES.COMPANIES_TO_FILES.COLUMNS;
    const colsOtherOrganizations = SQL_TABLES.OTHER_ORGANIZATIONS.COLUMNS;
    try {
        const { body, files } = req;
        const { step3Data } = res.locals;
        const { transactionList, companyHeadId } = step3Data;


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

        const dataToStore = Object.keys(files).reduce((acc, type) => {
            const [dbFiles, dbCompaniesFiles, storageFiles] = acc;
            files[type].forEach(file => {
                const fileLabels = new SqlArray([type, DOCUMENTS_SET.has(type) ? FILES_GROUPS.BASIC: FILES_GROUPS.CUSTOM]);
                const fileId = uuid();
                const fileHash = uuid();
                const filePath = `${fileHash}${file.originalname}`;
                const fileUrl = formatStoringFile(AWS_S3_BUCKET_NAME, filePath);
                dbFiles.push({
                    id: fileId,
                    [colsFiles.NAME]: file.originalname,
                    [colsFiles.LABELS]: fileLabels,
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

        const companyFiles = await CompaniesFilesService.getFilesByCompanyId(company.id);

        if (companyFiles.length) {
            // delete old files

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
        }

        transactionList.push(
            FilesService.addFilesAsTransaction(dbFiles)
        );
        transactionList.push(
            CompaniesFilesService.addRecordsAsTransaction(dbCompaniesFiles)
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
