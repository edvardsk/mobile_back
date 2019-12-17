const uuid = require('uuid/v4');

// constants
const { SqlArray } = require('constants/instances');
const { DOCUMENTS_SET, FILES_GROUPS } = require('constants/files');
const { SQL_TABLES } = require('constants/tables');

// services
const CryptService = require('services/crypto');

const {
    AWS_S3_BUCKET_NAME,
} = process.env;

const cols = SQL_TABLES.FILES.COLUMNS;
const colsCompaniesFiles = SQL_TABLES.COMPANIES_TO_FILES.COLUMNS;
const colsUsersFiles = SQL_TABLES.USERS_TO_FILES.COLUMNS;
const colsCarsFiles = SQL_TABLES.CARS_TO_FILES.COLUMNS;
const colsTrailersFiles = SQL_TABLES.TRAILERS_TO_FILES.COLUMNS;
const colsDraftDriversFiles = SQL_TABLES.DRAFT_DRIVERS_TO_FILES.COLUMNS;
const colsDraftFiles = SQL_TABLES.DRAFT_FILES.COLUMNS;

const formatStoringFile = (bucket, path) => `${bucket}/${path}`;

const unformatStoringFile = string => string.split('/');

const formatLabelsToStore = string => {
    const labels = [];
    const splitLabels = string.split('.');
    const possibleBasicLabel = splitLabels.shift();
    if (DOCUMENTS_SET.has(possibleBasicLabel) && splitLabels.length) {
        labels.push(possibleBasicLabel);
        labels.push(FILES_GROUPS.BASIC);
        labels.push(splitLabels.toString());
    } else if (DOCUMENTS_SET.has(possibleBasicLabel)) {
        labels.push(possibleBasicLabel);
        labels.push(FILES_GROUPS.BASIC);
    } else {
        labels.push(string);
        labels.push(FILES_GROUPS.CUSTOM);
    }

    return new SqlArray(labels);
};

const formatFilesForResponse = files => files.map(file => (
    formatFileForResponse(file)
));

const formatFileForResponse = file => ({
    id: file.id,
    [cols.NAME]: file[cols.NAME],
    [cols.URL]: file[cols.URL],
    [cols.LABELS]: file[cols.LABELS],
    [cols.CREATED_AT]: file[cols.CREATED_AT],
});

const prepareFilesToStoreForCompanies = (files, companyId) => Object.keys(files).reduce((acc, type) => {
    const [dbFiles, dbCompaniesFiles, storageFiles] = acc;
    files[type].forEach(file => {
        const fileLabels = formatLabelsToStore(type);
        const fileId = uuid();
        const fileHash = uuid();
        const filePath = `${fileHash}${file.originalname}`;
        const fileUrl = formatStoringFile(AWS_S3_BUCKET_NAME, filePath);
        dbFiles.push({
            id: fileId,
            [cols.NAME]: file.originalname,
            [cols.LABELS]: fileLabels,
            [cols.URL]: CryptService.encrypt(fileUrl),
        });
        dbCompaniesFiles.push({
            [colsCompaniesFiles.COMPANY_ID]: companyId,
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

const prepareFilesToStoreForUsers = (files, userId) => Object.keys(files).reduce((acc, type) => {
    const [dbFiles, dbUsersFiles, storageFiles] = acc;
    files[type].forEach(file => {
        const fileId = uuid();
        const fileHash = uuid();
        const filePath = `${fileHash}${file.originalname}`;
        const fileUrl = formatStoringFile(AWS_S3_BUCKET_NAME, filePath);

        const fileLabels = formatLabelsToStore(type);

        dbFiles.push({
            id: fileId,
            [cols.NAME]: file.originalname,
            [cols.LABELS]: fileLabels,
            [cols.URL]: CryptService.encrypt(fileUrl),
        });
        dbUsersFiles.push({
            [colsUsersFiles.USER_ID]: userId,
            [colsUsersFiles.FILE_ID]: fileId,
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

const prepareFilesToStoreForCars = (files, carId) => Object.keys(files).reduce((acc, type) => {
    const [dbFiles, dbUsersFiles, storageFiles] = acc;
    files[type].forEach(file => {
        const fileId = uuid();
        const fileHash = uuid();
        const filePath = `${fileHash}${file.originalname}`;
        const fileUrl = formatStoringFile(AWS_S3_BUCKET_NAME, filePath);

        const fileLabels = formatLabelsToStore(type);

        dbFiles.push({
            id: fileId,
            [cols.NAME]: file.originalname,
            [cols.LABELS]: fileLabels,
            [cols.URL]: CryptService.encrypt(fileUrl),
        });
        dbUsersFiles.push({
            [colsCarsFiles.CAR_ID]: carId,
            [colsCarsFiles.FILE_ID]: fileId,
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

const prepareFilesToStoreForTrailers = (files, trailerId) => Object.keys(files).reduce((acc, type) => {
    const [dbFiles, dbTrailersFiles, storageFiles] = acc;
    files[type].forEach(file => {
        const fileId = uuid();
        const fileHash = uuid();
        const filePath = `${fileHash}${file.originalname}`;
        const fileUrl = formatStoringFile(AWS_S3_BUCKET_NAME, filePath);

        const fileLabels = formatLabelsToStore(type);

        dbFiles.push({
            id: fileId,
            [cols.NAME]: file.originalname,
            [cols.LABELS]: fileLabels,
            [cols.URL]: CryptService.encrypt(fileUrl),
        });
        dbTrailersFiles.push({
            [colsTrailersFiles.TRAILER_ID]: trailerId,
            [colsCarsFiles.FILE_ID]: fileId,
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

const prepareFilesToStoreForDraftDrivers = (files, draftDriverId) => Object.keys(files).reduce((acc, type) => {
    const [dbFiles, dbDraftDriversFiles, storageFiles] = acc;
    files[type].forEach(file => {
        const fileId = uuid();
        const fileHash = uuid();
        const filePath = `${fileHash}${file.originalname}`;
        const fileUrl = formatStoringFile(AWS_S3_BUCKET_NAME, filePath);

        const fileLabels = formatLabelsToStore(type);

        dbFiles.push({
            id: fileId,
            [colsDraftFiles.NAME]: file.originalname,
            [colsDraftFiles.LABELS]: fileLabels,
            [colsDraftFiles.URL]: CryptService.encrypt(fileUrl),
        });
        dbDraftDriversFiles.push({
            [colsDraftDriversFiles.DRAFT_DRIVER_ID]: draftDriverId,
            [colsDraftDriversFiles.DRAFT_FILE_ID]: fileId,
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

const prepareFilesToDelete = files => files.reduce((acc, file) => {
    const [ids, urls] = acc;
    ids.push(file.id);
    urls.push(CryptService.decrypt(file[cols.URL]));
    return acc;

}, [[], []]);

const selectFilesToStore = (files, mapData) => {
    const result = {};
    Object.keys(mapData).forEach(prop => {
        if (files[prop]) {
            result[mapData[prop]] = files[prop];
        }
    });
    return result;
};

module.exports = {
    formatStoringFile,
    unformatStoringFile,
    formatLabelsToStore,
    formatFilesForResponse,
    prepareFilesToStoreForCompanies,
    prepareFilesToStoreForUsers,
    prepareFilesToStoreForCars,
    prepareFilesToStoreForTrailers,
    prepareFilesToStoreForDraftDrivers,
    prepareFilesToDelete,
    selectFilesToStore,
};
