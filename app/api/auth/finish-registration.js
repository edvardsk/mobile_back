const { success } = require('api/response');
const uuid = require('uuid/v4');

// services
const CryptService = require('services/crypto');
const FilesService = require('services/tables/files');
const FileLabelsService = require('services/tables/file-labels');
const FilesLabelsService = require('services/tables/files-to-labels');
const UsersFilesService = require('services/tables/users-to-files');
const CompaniesService = require('services/tables/companies');
const TableService = require('services/tables');
const UsersRolesService = require('services/tables/users-to-roles');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES } = require('constants/tables');
const { MAP_FROM_PENDING_ROLE_TO_MAIN } = require('constants/system');

// formatters
const { formatInitialDataToSave } = require('formatters/companies');

const { AWS_S3_BUCKET_NAME } = process.env;

const finishRegistration = async (req, res, next) => {
    const colsFiles = SQL_TABLES.FILES.COLUMNS;
    const colsFileLabels = SQL_TABLES.FILE_LABELS.COLUMNS;
    const colsFilesToLabels = SQL_TABLES.FILES_TO_FILE_LABELS.COLUMNS;
    const colsUsersFiles = SQL_TABLES.USERS_TO_FILES.COLUMNS;
    try {
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const { files } = req;

        const labels = await FileLabelsService.getLabels();

        const filesToSave = Object.keys(files).reduce((filesToSave, file) => {
            const fileGroup = files[file];
            fileGroup.forEach(file => {
                const id = uuid();
                const fileStorage = [];
                const label = labels.find(label => label[colsFileLabels.NAME] === file.fieldname);
                if (!label) {
                    throw new Error();
                }
                fileStorage.push({
                    id,
                    [colsFiles.NAME]: file.originalname,
                    [colsFiles.URL]: CryptService.encrypt(`${AWS_S3_BUCKET_NAME}/${id}`),
                });
                fileStorage.push({
                    [colsUsersFiles.FILE_ID]: id,
                    [colsUsersFiles.USER_ID]: userId,
                });
                fileStorage.push({
                    [colsFilesToLabels.FILE_ID]: id,
                    [colsFilesToLabels.LABEL_ID]: label.id,
                });
                fileStorage.push({
                    bucket: AWS_S3_BUCKET_NAME,
                    path: id,
                    data: file.buffer,
                });
                filesToSave.push(fileStorage);
            });
            return filesToSave;

        }, [] /* [file, users to files, files_to_labels, files to s3] */);

        const companyData = formatInitialDataToSave(req.body, userId);

        await TableService.runTransaction([
            FilesService.addFilesAsTransaction(filesToSave.map(fileData => fileData[0])),
            UsersFilesService.addRecordsAsTransaction(filesToSave.map(fileData => fileData[1])),
            FilesLabelsService.addRecordsAsTransaction(filesToSave.map(fileData => fileData[2])),
            CompaniesService.addCompanyAsTransaction(companyData),
        ]);

        await Promise.all(filesToSave.map(fileGroup => {
            const { bucket, path, data } = fileGroup.pop();
            return S3Service.putObject(bucket, path, data);
        }));

        const updatedRole = MAP_FROM_PENDING_ROLE_TO_MAIN[userRole];

        UsersRolesService.updateUserRole(userId, updatedRole);
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    finishRegistration,
};
