const { manyOrNone } = require('db');

// sql-helpers
const {
    insertFiles,

    selectFilesByCompanyId,
    selectFilesByCompanyIdAndLabel,
    selectFilesByCompanyIdAndLabels,
    selectFilesByCarIdAndLabels,
    selectFilesByCarIdAndArrayLabels,
    selectFilesByTrailerIdAndLabels,
    selectFilesByTrailerIdAndArrayLabels,
    selectFilesByUserIdAndLabels,
    selectFilesByUserId,
    selectFilesByDriverIdAndLabels,
    selectFilesByCarId,
    selectFilesByTrailerId,

    deleteFilesByIds,
} = require('sql-helpers/files');

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

const getFilesByCompanyId = companyId => manyOrNone(selectFilesByCompanyId(companyId));

const getFilesByCompanyIdAndFileGroup = (companyId, fileGroup) => manyOrNone(selectFilesByCompanyIdAndLabel(companyId, fileGroup));

const getFilesByCompanyIdAndLabels = (companyId, labels) => manyOrNone(selectFilesByCompanyIdAndLabels(companyId, labels));

const getFilesByCarIdAndLabels = (carId, labels) => manyOrNone(selectFilesByCarIdAndLabels(carId, labels));

const getFilesByCarIdAndArrayLabels = (carId, labelsArr) => manyOrNone(selectFilesByCarIdAndArrayLabels(carId, labelsArr));

const getFilesByTrailerIdAndLabels = (trailerId, labels) => manyOrNone(selectFilesByTrailerIdAndLabels(trailerId, labels));

const getFilesByTrailerIdAndArrayLabels = (trailerId, labelsArr) => manyOrNone(selectFilesByTrailerIdAndArrayLabels(trailerId, labelsArr));

const getFilesByUserIdAndLabels = (userId, fileLabels) => manyOrNone(selectFilesByUserIdAndLabels(userId, fileLabels));

const getFilesByDriverIdAndLabels = (driverId, labelsArr) => manyOrNone(selectFilesByDriverIdAndLabels(driverId, labelsArr));

const getFilesByUserId = userId => manyOrNone(selectFilesByUserId(userId));

const getFilesByCarId = carId => manyOrNone(selectFilesByCarId(carId));

const getFilesByTrailerId = trailerId => manyOrNone(selectFilesByTrailerId(trailerId));

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

module.exports = {
    addFilesAsTransaction,

    getFilesByCompanyId,
    getFilesByCompanyIdAndFileGroup,
    getFilesByCompanyIdAndLabels,
    getFilesByCarIdAndLabels,
    getFilesByCarIdAndArrayLabels,
    getFilesByTrailerIdAndLabels,
    getFilesByTrailerIdAndArrayLabels,
    getFilesByUserIdAndLabels,
    getFilesByUserId,
    getFilesByDriverIdAndLabels,
    getFilesByCarId,
    getFilesByTrailerId,

    removeFilesByIdsAsTransaction,

    formatTemporaryLinks,
};
