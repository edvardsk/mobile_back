const { success, reject } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const FilesService = require('services/tables/files');
const S3Service = require('services/aws/s3');
const CryptoService = require('services/crypto');

// constants
const { ERRORS } = require('constants/errors');
const { SQL_TABLES } = require('constants/tables');

// formatters
const { unformatStoringFile } = require('formatters/files');

const { FILES_PREVIEW_LIFETIME_SECONDS } = process.env;

const getGroupFiles = async (req, res, next) => {
    const colsFiles = SQL_TABLES.FILES.COLUMNS;
    try {
        const currentUserId = res.locals.user.id;
        const isControlRole = res.locals.user.isControlRole;

        const { meOrId, fileGroup } = req.params;

        let company;

        if (isControlRole) {
            company = await CompaniesService.getCompany(meOrId);
            if (!company) {
                return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
            }
        } else {
            company = await CompaniesService.getCompanyByUserId(currentUserId);
        }

        const files = await FilesService.getFilesByCompanyIdAndFileGroup(company.id, fileGroup);

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
    getGroupFiles,
};
