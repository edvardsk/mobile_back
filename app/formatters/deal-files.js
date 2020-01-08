const uuid = require('uuid/v4');

// constants
const { SqlArray } = require('constants/instances');
const { SQL_TABLES } = require('constants/tables');
const { UUID_LENGTH, ENTITIES } = require('constants/index');

// services
const CryptService = require('services/crypto');

// formatters
const FilesFormatters = require('./files');

const {
    AWS_S3_BUCKET_NAME,
} = process.env;

const cols = SQL_TABLES.DEAL_FILES.COLUMNS;
const colsFiles = SQL_TABLES.FILES.COLUMNS;
const colsDealCarsFiles = SQL_TABLES.DEAL_CARS_TO_FILES.COLUMNS;
const colsDealTrailersFiles = SQL_TABLES.DEAL_TRAILERS_TO_FILES.COLUMNS;
const colsDealDriversFiles = SQL_TABLES.DEAL_DRIVERS_TO_FILES.COLUMNS;

const prepareFilesToStoreForCarsFromOriginal = (entity, files, dealInstanceId, dealId) => files.reduce((acc, file) => {
    const [dbFiles, dbInstanceFiles, copyFiles] = acc;
    const fileId = uuid();

    const fileLabels = new SqlArray(file[colsFiles.LABELS]);

    const fileHash = uuid();

    const fileName = FilesFormatters.unformatStoringFile(file[colsFiles.URL]).pop().substring(UUID_LENGTH);

    const filePath = `${fileHash}${fileName}`;
    const fileUrl = FilesFormatters.formatStoringFile(AWS_S3_BUCKET_NAME, filePath);

    dbFiles.push({
        id: fileId,
        [cols.NAME]: fileName,
        [cols.LABELS]: fileLabels,
        [cols.URL]: CryptService.encrypt(fileUrl),
        [cols.CREATED_AT]: file[colsFiles.CREATED_AT].toISOString(),
    });

    copyFiles.push({
        bucket: AWS_S3_BUCKET_NAME,
        oldPath: file[colsFiles.URL],
        newPath: filePath,
    });

    switch (entity) {
    case ENTITIES.CAR: {
        dbInstanceFiles.push({
            [colsDealCarsFiles.DEAL_CAR_ID]: dealInstanceId,
            [colsDealCarsFiles.DEAL_FILE_ID]: fileId,
            [colsDealCarsFiles.DEAL_ID]: dealId,
            [colsDealCarsFiles.CREATED_AT]: file[colsFiles.CREATED_AT].toISOString(),
        });
        break;
    }

    case ENTITIES.TRAILER: {
        dbInstanceFiles.push({
            [colsDealTrailersFiles.DEAL_TRAILER_ID]: dealInstanceId,
            [colsDealTrailersFiles.DEAL_FILE_ID]: fileId,
            [colsDealTrailersFiles.DEAL_ID]: dealId,
            [colsDealTrailersFiles.CREATED_AT]: file[colsFiles.CREATED_AT].toISOString(),
        });
        break;
    }

    case ENTITIES.DRIVER: {
        dbInstanceFiles.push({
            [colsDealDriversFiles.DEAL_DRIVER_ID]: dealInstanceId,
            [colsDealDriversFiles.DEAL_FILE_ID]: fileId,
            [colsDealDriversFiles.DEAL_ID]: dealId,
            [colsDealDriversFiles.CREATED_AT]: file[colsFiles.CREATED_AT].toISOString(),
        });
        break;
    }

    default: {
        throw new Error();
    }
    }

    return acc;
}, [[], [], []]);

module.exports = {
    prepareFilesToStoreForCarsFromOriginal,
};
