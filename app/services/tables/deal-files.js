// sql-helpers
const {
    insertFiles,
    deleteFilesByIds,
} = require('sql-helpers/deal-files');

// services
const CryptoService = require('../crypto');
const S3Service = require('../aws/s3');

// formatters
const { unformatStoringFile } = require('formatters/files');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.FILES.COLUMNS;

const { FILES_PREVIEW_LIFETIME_SECONDS } = process.env;

const addFilesAsTransaction = data => [insertFiles(data), OPERATIONS.MANY_OR_NONE];

const removeFilesByIdsAsTransaction = ids => [deleteFilesByIds(ids), OPERATIONS.MANY_OR_NONE];

const formatTemporaryLinks = async files => {
    const decryptedFiles = files.map(file => {
        const url = CryptoService.decrypt(file[cols.URL]);
        return {
            ...file,
            url,
        };
    });

    const signedUrls = await Promise.all(decryptedFiles.map(file => {
        const [bucket, path] = unformatStoringFile(file[cols.URL]);
        return S3Service.getSignedUrl(bucket, path, +FILES_PREVIEW_LIFETIME_SECONDS);
    }));

    return decryptedFiles.map((file, i) => ({
        ...file,
        [cols.URL]: signedUrls[i],
    }));
};

const formatDataWithDecryptedUrl = files => files.map(file => {
    const url = CryptoService.decrypt(file[cols.URL]);
    return {
        ...file,
        [cols.URL]: url,
    };
});

module.exports = {
    addFilesAsTransaction,
    removeFilesByIdsAsTransaction,

    formatTemporaryLinks,
    formatDataWithDecryptedUrl,
};
