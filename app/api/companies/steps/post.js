const { success } = require('api/response');

// services
// const CryptService = require('services/crypto');
// const FilesService = require('services/tables/files');
// const UsersService = require('services/tables/users');
// const CompaniesService = require('services/tables/companies');
// const RoutesService = require('services/tables/routes');
// const OtherOrganizationsService = require('services/tables/other-organizations');
// const CompaniesFilesService = require('services/tables/companies-to-files');
// const UsersCompaniesService = require('services/tables/users-to-companies');
// const UserPermissionsService = require('services/tables/users-to-permissions');
// const TablesService = require('services/tables');
// const S3Service = require('services/aws/s3');

// constants
// const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
// const { ROLES, PERMISSIONS } = require('constants/system');
const { SUCCESS_CODES } = require('constants/http-codes');

// formatters
// const UsersCompaniesFormatters = require('formatters/users-to-companies');
// const FinishRegistrationFormatters = require('formatters/finish-registration');
// const { formatStoringFile } = require('formatters/files');
// const { formatGeoDataValuesToSave } = require('formatters/geo');
// const { formatRoutesToSave } = require('formatters/routes');
// const { formatCompanyDataOnStep2 } = require('formatters/companies');

// const { AWS_S3_BUCKET_NAME } = process.env;

const editStep1 = async (req, res, next) => {
    try {
        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const editStep2 = async (req, res, next) => {
    try {
        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

const editStep3 = async (req, res, next) => {
    try {
        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editStep1,
    editStep2,
    editStep3,
};
