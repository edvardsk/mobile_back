const { success, reject } = require('api/response');
const { get } = require('lodash');

// services
const UsersService = require('services/tables/users');
const UsersCompaniesService = require('services/tables/users-to-companies');
const DriverService = require('services/tables/drivers');
const DraftDriverService = require('services/tables/draft-drivers');
const FilesService = require('services/tables/files');
const DraftFilesService = require('services/tables/draft-files');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { SORTING_DIRECTIONS } = require('constants/pagination-sorting');
const { SET_DRIVER_ROLES } = require('constants/system');

// formatters
const { formatPaginationDataForResponse } = require('formatters/pagination-sorting');
const { formatUserWithPhoneAndRole, formatUserWithPhoneNumberAndRole, formatUserFromDraftDriver } = require('formatters/users');
const { formatDriversWithPhoneAndRole } = require('formatters/drivers');
const { formatFilesForResponse, mergeFilesWithDraft } = require('formatters/files');

// helpers
const { getParams } = require('helpers/pagination-sorting');

const employeesPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: 'id',
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;
const colsDraftDrivers = SQL_TABLES.DRAFT_DRIVERS.COLUMNS;

const getListEmployees = async (req, res, next) => {
    try {
        const { company } = res.locals;

        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, employeesPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [users, usersCount] = await Promise.all([
            UsersService.getUsersByCompanyIdPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter),
            UsersService.getCountUsersByCompanyId(company.id, filter)
        ]);

        const result = formatPaginationDataForResponse(
            users.map(user => formatUserWithPhoneAndRole(user)),
            usersCount,
            limit,
            page,
            sortColumn,
            asc,
            filter
        );

        return success(res, result);
    } catch (error) {
        next(error);
    }
};

const driversPaginationOptions = {
    DEFAULT_LIMIT: 5,
    DEFAULT_SORT_COLUMN: SQL_TABLES.USERS.COLUMNS.CREATED_AT,
    DEFAULT_SORT_DIRECTION: SORTING_DIRECTIONS.ASC,
};

const getListDrivers = async (req, res, next) => {
    try {
        const { company } = res.locals;

        const {
            page,
            limit,
            sortColumn,
            asc,
        } = getParams(req, driversPaginationOptions);

        const filter = get(req, 'query.filter', {});

        const [drivers, driversCount] = await Promise.all([
            UsersService.getCompanyDriversPaginationSorting(company.id, limit, limit * page, sortColumn, asc, filter),
            UsersService.getCountCompanyDrivers(company.id, filter)
        ]);

        const result = formatPaginationDataForResponse(
            drivers.map(driver => formatDriversWithPhoneAndRole(driver)),
            driversCount,
            limit,
            page,
            sortColumn,
            asc,
            filter
        );

        return success(res, result);
    } catch (error) {
        next(error);
    }
};

const getEmployee = async (req, res, next) => {
    try {
        const { company, isControlRole } = res.locals;
        const targetUserId = req.params.userId;

        const isFromOneCompany = await UsersCompaniesService.hasCompanyUser(company.id, targetUserId);
        if (!isFromOneCompany) {
            return reject(res, ERRORS.COMPANIES.NOT_USER_IN_COMPANY);
        }

        const user = await UsersService.getUserWithRoleAndPhoneNumber(targetUserId);
        const targetRole = user[HOMELESS_COLUMNS.ROLE];

        const result = {
            user: formatUserWithPhoneNumberAndRole(user),
        };

        if (SET_DRIVER_ROLES.has(targetRole)) {
            const [driver, draftDriver, files, draftFiles] = await Promise.all([
                DriverService.getRecordByUserId(targetUserId),
                DraftDriverService.getRecordByUserId(targetUserId),
                FilesService.getFilesByUserId(targetUserId),
                DraftFilesService.getFilesByUserId(targetUserId),
            ]);

            if (isControlRole) {
                result.driver = driver;
                result.draftDriver = draftDriver;

                const [filesLinks, draftFilesLinks] = await Promise.all([
                    FilesService.formatTemporaryLinks(files),
                    FilesService.formatTemporaryLinks(draftFiles),
                ]);
                result.files = formatFilesForResponse(filesLinks);
                result.draftFiles = formatFilesForResponse(draftFilesLinks);

            } else {
                result.driver = driver;

                let mergedFiles = files;

                if (draftDriver) {
                    result.user = {
                        ...result.user,
                        ...formatUserFromDraftDriver(draftDriver),
                    };

                    result.driver = {
                        ...driver,
                        [colsDrivers.DRIVER_LICENCE_REGISTERED_AT]: draftDriver[colsDraftDrivers.DRIVER_LICENCE_REGISTERED_AT],
                        [colsDrivers.DRIVER_LICENCE_EXPIRED_AT]: draftDriver[colsDraftDrivers.DRIVER_LICENCE_EXPIRED_AT],
                        [HOMELESS_COLUMNS.IS_DRAFT]: true,
                    };

                    if (draftFiles.length) {
                        mergedFiles = mergeFilesWithDraft(files, draftFiles);
                    }
                } else {
                    result.driver = {
                        ...driver,
                        [HOMELESS_COLUMNS.IS_DRAFT]: false,
                    };
                }

                const filesLinks = await FilesService.formatTemporaryLinks(mergedFiles);
                const formattedFilesLinks = formatFilesForResponse(filesLinks);

                result.files = formattedFilesLinks;
            }
        }

        return success(res, { ...result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListEmployees,
    getListDrivers,
    getEmployee,
};
