const { getPermissionsForDb } = require('../app/formatters/system');
const { PERMISSIONS } = require('../app/constants/system');
const { SQL_TABLES } = require('../app/constants/tables');

const colsPermissions = SQL_TABLES.PERMISSIONS.COLUMNS;

const permissionsToAdd = [
    PERMISSIONS.REGISTRATION_SAVE_STEP_1,
    PERMISSIONS.REGISTRATION_SAVE_STEP_2,
    PERMISSIONS.REGISTRATION_SAVE_STEP_3,
    PERMISSIONS.REGISTRATION_SAVE_STEP_4,
    PERMISSIONS.REGISTRATION_SAVE_STEP_5,
];

const permissions = getPermissionsForDb().filter(permission => permissionsToAdd.includes(permission[colsPermissions.NAME]));

exports.up = function(knex) {
    return knex.batchInsert('permissions', permissions);
};

exports.down = function(knex) {
    return Promise.all(permissionsToAdd.map(permission => (
        knex('permissions')
            .where(colsPermissions.NAME, permission)
            .del()
    )));
};
