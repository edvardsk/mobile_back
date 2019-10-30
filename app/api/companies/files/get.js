const { success, reject } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const FilesService = require('services/tables/files');
const UsersService = require('services/tables/users');
const S3Service = require('services/aws/s3');
const CryptoService = require('services/crypto');

// constants
const { ERRORS } = require('constants/errors');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');
const { ROLES } = require('constants/system');

// formatters
const { unformatStoringFile } = require('formatters/files');

const { FILES_PREVIEW_LIFETIME_SECONDS } = process.env;

const MAP_ROLES_TO_LIST_NON_CUSTOM_FILES = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: [DOCUMENTS.STATE_REGISTRATION_CERTIFICATE, DOCUMENTS.INSURANCE_POLICY, DOCUMENTS.RESIDENCY_CERTIFICATE],
    [ROLES.TRANSPORTER]: [DOCUMENTS.STATE_REGISTRATION_CERTIFICATE, DOCUMENTS.INSURANCE_POLICY, DOCUMENTS.RESIDENCY_CERTIFICATE],

    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: [DOCUMENTS.STATE_REGISTRATION_CERTIFICATE, DOCUMENTS.RESIDENCY_CERTIFICATE],
    [ROLES.HOLDER]: [DOCUMENTS.STATE_REGISTRATION_CERTIFICATE, DOCUMENTS.RESIDENCY_CERTIFICATE],

    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: [DOCUMENTS.PASSPORT],
    [ROLES.INDIVIDUAL_FORWARDER]: [DOCUMENTS.PASSPORT],

    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: [DOCUMENTS.PASSPORT, DOCUMENTS.STATE_REGISTRATION_CERTIFICATE],
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: [DOCUMENTS.PASSPORT, DOCUMENTS.STATE_REGISTRATION_CERTIFICATE],
};

const getNonCustomFiles = async (req, res, next) => {
    const colsFiles = SQL_TABLES.FILES.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const isControlRole = res.locals.user.isControlRole;

        const { meOrId } = req.params;

        let company;
        let userData;

        if (isControlRole) {
            company = await CompaniesService.getCompany(meOrId);
            if (!company) {
                return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
            }
            userData = await UsersService.getFirstUserInCompanyStrict(company.id);
        } else {
            company = await CompaniesService.getCompanyByUserId(currentUserId);
            userData = {
                ...res.locals.user,
            };
        }

        const userRole = userData[HOMELESS_COLUMNS.ROLE];

        const listNonCustomFileTypes = MAP_ROLES_TO_LIST_NON_CUSTOM_FILES[userRole];

        const files = await FilesService.getFilesByCompanyIdAndTypes(company.id, listNonCustomFileTypes);

        const decryptedFiles = files.map(file => {
            const url = CryptoService.decrypt(file[colsFiles.URL]);
            return {
                ...file,
                url,
            };
        });

        const signedUrls = await Promise.all(decryptedFiles.map(file => {
            const [bucket, path] = unformatStoringFile(file[colsFiles.URL]);
            return S3Service.getSignedUrl(bucket, path, +FILES_PREVIEW_LIFETIME_SECONDS);
        }));

        const resultFiles = decryptedFiles.map((file, i) => {
            return {
                ...file,
                [colsFiles.URL]: signedUrls[i],
            };
        });

        return success(res, { files: resultFiles } );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNonCustomFiles,
};
