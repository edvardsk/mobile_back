const { success, reject } = require('api/response');
const uuid = require('uuid/v4');
const moment = require('moment');

// services
const UsersService = require('services/tables/users');
const CompaniesService = require('services/tables/companies');
const FilesService = require('services/tables/files');
const DriversService = require('services/tables/drivers');
const UsersFilesService = require('services/tables/users-to-files');
const EmailConfirmationService = require('services/tables/email-confirmation-hashes');
const UsersRolesService = require('services/tables/users-to-roles');
const PhoneNumbersService = require('services/tables/phone-numbers');
const UsersCompaniesService = require('services/tables/users-to-companies');
const TableService = require('services/tables');
const CryptService = require('services/crypto');
const MailService = require('services/mail');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES } = require('constants/tables');
const { SUCCESS_CODES } = require('constants/http-codes');
const { ROLES, MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED } = require('constants/system');
const { ERRORS } = require('constants/errors');

// formatters
const UsersFormatters = require('formatters/users');
const EmailConfirmationFormatters = require('formatters/email-confirmation');
const UsersCompaniesFormatters = require('formatters/users-to-companies');
const PhoneNumbersFormatters = require('formatters/phone-numbers');
const FilesFormatters = require('formatters/files');
const DriversFormatters = require('formatters/drivers');

const {
    AWS_S3_BUCKET_NAME,
    INVITE_EXPIRATION_UNIT,
    INVITE_EXPIRATION_VALUE,
} = process.env;

const inviteUser = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const { isControlRole } = res.locals.user;
        const { shadowUserId } = res.locals;
        const { role } = req.params;

        let companyHeadId;
        if (isControlRole) {
            companyHeadId = shadowUserId;
        } else {
            companyHeadId = currentUserId;
        }

        const company = await CompaniesService.getCompanyByUserId(companyHeadId);
        if (!company) {
            return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
        }

        const invitedUserId = uuid();
        const userCompanyData = UsersCompaniesFormatters.formatRecordToSave(invitedUserId, company.id);

        const transactionsListHead = [];
        const transactionsListTail = [];

        transactionsListTail.push(
            UsersCompaniesService.addRecordAsTransaction(userCompanyData)
        );

        const inviteData = {
            invitedUserId,
            invitedUserRole: role,
            transactionsListHead,
            transactionsListTail,
        };

        res.locals.inviteData = inviteData;

        return next();
    } catch (error) {
        next(error);
    }
};

const inviteUserAdvanced = async (req, res, next) => {
    const colsFiles = SQL_TABLES.FILES.COLUMNS;
    const colsUsersFiles = SQL_TABLES.USERS_TO_FILES.COLUMNS;
    try {
        const { inviteData } = res.locals;
        const { files, body } = req;
        const { transactionsListTail, invitedUserId, invitedUserRole } = inviteData;

        const dataToStore = Object.keys(files).reduce((acc, type) => {
            const [dbFiles, dbUsersFiles, storageFiles] = acc;
            files[type].forEach(file => {
                const fileId = uuid();
                const fileHash = uuid();
                const filePath = `${fileHash}${file.originalname}`;
                const fileUrl = FilesFormatters.formatStoringFile(AWS_S3_BUCKET_NAME, filePath);

                const fileLabels = FilesFormatters.formatLabelsToStore(type);

                dbFiles.push({
                    id: fileId,
                    [colsFiles.NAME]: file.originalname,
                    [colsFiles.LABELS]: fileLabels,
                    [colsFiles.URL]: CryptService.encrypt(fileUrl),
                });
                dbUsersFiles.push({
                    [colsUsersFiles.USER_ID]: invitedUserId,
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

        const [dbFiles, dbUsersFiles, storageFiles] = dataToStore;

        res.locals.inviteData.storageFiles = storageFiles;

        transactionsListTail.push(
            FilesService.addFilesAsTransaction(dbFiles)
        );
        transactionsListTail.push(
            UsersFilesService.addRecordsAsTransaction(dbUsersFiles)
        );

        if (invitedUserRole === ROLES.DRIVER) {
            const driverData = DriversFormatters.formatRecordToSave(invitedUserId, body);
            transactionsListTail.push(
                DriversService.addRecordAsTransaction(driverData)
            );
        }

        return next();
    } catch (error) {
        next(error);
    }
};

const inviteUserWithoutCompany = async (req, res, next) => {
    try {
        const invitedUserId = uuid();
        const inviteData = {
            invitedUserId,
            transactionsListHead: [],
            transactionsListTail: [],
        };
        res.locals.inviteData = inviteData;
        return next();
    } catch (error) {
        next(error);
    }
};

const inviteMiddleware = async (req, res, next) => {
    const colsUsers = SQL_TABLES.USERS.COLUMNS;
    try {
        const { inviteData } = res.locals;
        const { transactionsListHead, transactionsListTail, invitedUserId, storageFiles } = inviteData;

        const currentUserId = res.locals.user.id;
        const { body } = req;
        const { role } = req.params;
        const unconfirmedRole = MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED[role];
        const phoneNumber = body.phone_number;
        const phonePrefixId = body.phone_prefix_id;
        const email = body[colsUsers.EMAIL];

        const password = uuid();
        const { hash, key } = await CryptService.hashPassword(password);

        const userId = invitedUserId;
        const confirmationHash = uuid();

        const data = UsersFormatters.formatUserForSaving(userId, body, hash, key);

        const inviteExpirationDate = moment().add(+INVITE_EXPIRATION_VALUE, INVITE_EXPIRATION_UNIT).toISOString();
        const emailConfirmationData = EmailConfirmationFormatters.formatRecordToSave(userId, confirmationHash, currentUserId, inviteExpirationDate);
        const phoneNumberData = PhoneNumbersFormatters.formatPhoneNumberToSave(userId, phonePrefixId, phoneNumber);

        const transactionList = [
            UsersService.addUserAsTransaction(data),
            UsersRolesService.addUserRoleAsTransaction(userId, unconfirmedRole),
            EmailConfirmationService.addRecordAsTransaction(emailConfirmationData),
            PhoneNumbersService.addRecordAsTransaction(phoneNumberData),
        ];


        await TableService.runTransaction([
            ...transactionsListHead,
            ...transactionList,
            ...transactionsListTail,
        ]);

        if (storageFiles && Array.isArray(storageFiles) && storageFiles.length > 0) {
            await Promise.all(storageFiles.map(({ bucket, path, data, contentType }) => {
                return S3Service.putObject(bucket, path, data, contentType);
            }));
        }

        await MailService.sendConfirmationEmail(email, confirmationHash, role);
        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    inviteUser,
    inviteUserAdvanced,
    inviteUserWithoutCompany,
    inviteMiddleware,
};
