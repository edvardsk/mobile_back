const { manyOrNone } = require('db');

// sql-helpers
const {
    insertFiles,
    deleteFilesByIds,
    selectFilesByDraftDriverIdAndLabels,
    selectFilesByDraftDriverId,
    selectFilesByCarIdAndLabels,
    selectFilesByTrailerIdAndLabels,
    selectFilesByUserId,
    selectFilesByDraftCarId,
    selectFilesByDraftTrailerId,
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

const getFilesByDraftDriverIdAndLabels = (draftDriverId, labelsArr) => (
    manyOrNone(selectFilesByDraftDriverIdAndLabels(draftDriverId, labelsArr))
);

const getFilesByDraftDriverId = (draftDriverId) => (
    manyOrNone(selectFilesByDraftDriverId(draftDriverId))
);

const getFilesByCarIdAndLabels = (carId, labels) => (
    manyOrNone(selectFilesByCarIdAndLabels(carId, labels))
);

const getFilesByTrailerIdAndLabels = (trailerId, labels) => (
    manyOrNone(selectFilesByTrailerIdAndLabels(trailerId, labels))
);

const getFilesByUserId = (userId) => (
    manyOrNone(selectFilesByUserId(userId))
);

const getFilesByDraftCarId = (draftCarId) => (
    manyOrNone(selectFilesByDraftCarId(draftCarId))
);

const getFilesByDraftTrailerId = (draftTrailerId) => (
    manyOrNone(selectFilesByDraftTrailerId(draftTrailerId))
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
    removeFilesByIdsAsTransaction,
    getFilesByDraftDriverIdAndLabels,
    getFilesByDraftDriverId,
    getFilesByUserId,
    getFilesByCarIdAndLabels,
    getFilesByTrailerIdAndLabels,
    getFilesByDraftCarId,
    getFilesByDraftTrailerId,

    formatTemporaryLinks,
};
