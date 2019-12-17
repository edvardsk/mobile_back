const { manyOrNone } = require('db');

// sql-helpers
const {
    insertFiles,
    selectFilesByDraftDriverIdAndLabels,
    deleteFilesByIds,
} = require('sql-helpers/draft-files');

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

const getFilesByDraftDriverIdAndLabels = (draftDriverId, labels) => (
    manyOrNone(selectFilesByDraftDriverIdAndLabels(draftDriverId, labels))
);

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

module.exports = {
    addFilesAsTransaction,
    getFilesByDraftDriverIdAndLabels,
    removeFilesByIdsAsTransaction,

    formatTemporaryLinks,
};
