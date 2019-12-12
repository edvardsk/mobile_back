const uuid = require('uuid/v4');

const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.DRIVERS.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsDrivers = SQL_TABLES.DRIVERS.COLUMNS;
const colsUsersRoles = SQL_TABLES.USERS_TO_ROLES.COLUMNS;
const colsUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES.COLUMNS;
const colsPhoneNumbers = SQL_TABLES.PHONE_NUMBERS.COLUMNS;

const formatRecordToSave = (userId, body) => ({
    [cols.USER_ID]: userId,
    [cols.DRIVER_LICENCE_REGISTERED_AT]: body[cols.DRIVER_LICENCE_REGISTERED_AT],
    [cols.DRIVER_LICENCE_EXPIRED_AT]: body[cols.DRIVER_LICENCE_EXPIRED_AT],
});

const formatDriversWithPhoneAndRole = data => ({
    id: data.id,
    [colsUsers.FULL_NAME]: data[colsUsers.FULL_NAME],
    [colsUsers.EMAIL]: data[colsUsers.EMAIL],
    [HOMELESS_COLUMNS.ROLE]: data[HOMELESS_COLUMNS.ROLE],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: data[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [cols.DRIVER_LICENCE_REGISTERED_AT]: data[cols.DRIVER_LICENCE_REGISTERED_AT],
    [cols.DRIVER_LICENCE_EXPIRED_AT]: data[cols.DRIVER_LICENCE_EXPIRED_AT],
    [colsUsers.FREEZED]: data[colsUsers.FREEZED],
});

const formatRecordForList = data => ({
    [HOMELESS_COLUMNS.USER_ID]: data.id,
    [HOMELESS_COLUMNS.DRIVER_ID]: data[HOMELESS_COLUMNS.DRIVER_ID],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: data[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [colsUsers.EMAIL]: data[colsUsers.EMAIL],
    [colsUsers.FULL_NAME]: data[colsUsers.FULL_NAME],
});

const formatRecordForAvailableList = data => ({
    [HOMELESS_COLUMNS.USER_ID]: data.id,
    [HOMELESS_COLUMNS.DRIVER_ID]: data[HOMELESS_COLUMNS.DRIVER_ID],
    [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: data[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
    [HOMELESS_COLUMNS.PHONE_NUMBER]: data[HOMELESS_COLUMNS.PHONE_NUMBER],
    [HOMELESS_COLUMNS.PHONE_PREFIX_ID]: data[HOMELESS_COLUMNS.PHONE_PREFIX_ID],
    [colsUsers.EMAIL]: data[colsUsers.EMAIL],
    [colsUsers.FULL_NAME]: data[colsUsers.FULL_NAME],
});

const formatShadowDriversToSave = (drivers, driverRoleId, initiatorLanguageId, companyId) => {
    return drivers.reduce((acc, driver) => {
        const [users, drives, usersRoles, usersCompanies, phoneNumbers] = acc;
        const userId = uuid();
        users.push({
            id: userId,
            [colsUsers.FULL_NAME]: driver[HOMELESS_COLUMNS.FULL_NAME],
            [colsUsers.EMAIL]: uuid(),
            [colsUsers.PASSWORD]: uuid(),
            [colsUsers.KEY]: uuid(),
            [colsUsers.LANGUAGE_ID]: initiatorLanguageId,
        });
        usersRoles.push({
            [colsUsersRoles.USER_ID]: userId,
            [colsUsersRoles.ROLE_ID]: driverRoleId,
        });
        usersCompanies.push({
            [colsUsersCompanies.USER_ID]: userId,
            [colsUsersCompanies.COMPANY_ID]: companyId,
        });
        phoneNumbers.push({
            [colsPhoneNumbers.USER_ID]: userId,
            [colsPhoneNumbers.PHONE_PREFIX_ID]: driver[HOMELESS_COLUMNS.PHONE_PREFIX_ID],
            [colsPhoneNumbers.NUMBER]: driver[HOMELESS_COLUMNS.PHONE_NUMBER],
        });
        drives.push({
            id: driver[HOMELESS_COLUMNS.DRIVER_ID],
            [colsDrivers.USER_ID]: userId,
            [colsDrivers.SHADOW]: true,
        });
        return acc;

    }, [[], [], [], [], []]);
};

const formatRecordAsNotVerified = data => ({
    ...data,
    [colsDrivers.VERIFIED]: false,
});

module.exports = {
    formatRecordToSave,
    formatDriversWithPhoneAndRole,
    formatRecordForList,
    formatRecordForAvailableList,
    formatShadowDriversToSave,
    formatRecordAsNotVerified,
};
