const { getRolesToPermissionsForDb } = require('../app/formatters/system');
const FIRST_ROLES = require('./20191017143230_add_roles').ROLES;
const CONTROL_ROLES = require('./20191023095323_insert_roles').ROLES;

const PERMISSIONS = [
    {
        id: '1f73eb18-9481-46bd-a330-808d2a892804',
        name: 'modify_company_data_step_1',
    },
    {
        id: '997f5233-8fcb-45a8-b292-78895f0f8350',
        name: 'modify_company_data_step_2',
    },
    {
        id: 'bb253364-cebd-478d-ab29-c335b38376d9',
        name: 'modify_company_data_step_3',
    },
];

const ROLES_WITH_PERMISSIONS = [
    ['admin', [
        'modify_company_data_step_1',
        'modify_company_data_step_2',
        'modify_company_data_step_3',
    ]],
    ['manager', [
        'modify_company_data_step_1',
        'modify_company_data_step_2',
        'modify_company_data_step_3',
    ]],
    ['transporter', [
        'modify_company_data_step_1',
        'modify_company_data_step_2',
        'modify_company_data_step_3',
    ]],
    ['holder', [
        'modify_company_data_step_1',
        'modify_company_data_step_2',
        'modify_company_data_step_3',
    ]],
    ['individual_forwarder', [
        'modify_company_data_step_1',
        'modify_company_data_step_3',
    ]],
    ['sole_proprietor_forwarder', [
        'modify_company_data_step_1',
        'modify_company_data_step_2',
        'modify_company_data_step_3',
    ]],
];

const ALL_ROLES = [
    ...FIRST_ROLES,
    ...CONTROL_ROLES,
];

const ALL_PERMISSIONS = [
    ...PERMISSIONS,
];

const allRolesWithPermissions = getRolesToPermissionsForDb(ALL_ROLES, ALL_PERMISSIONS, ROLES_WITH_PERMISSIONS);

exports.PERMISSIONS = PERMISSIONS;

exports.up = function(knex) {
    return knex.batchInsert('permissions', PERMISSIONS)
        .then(function () {
            return knex.batchInsert('roles_to_permissions', allRolesWithPermissions);
        });
};

exports.down = function(knex) {
    return Promise.all(allRolesWithPermissions.map(({ role_id, permission_id }) => (
        knex('roles_to_permissions')
            .where('role_id', role_id)
            .andWhere('permission_id', permission_id)
            .del()
    )))
        .then(function () {
            return Promise.all(PERMISSIONS.map(permission => (
                knex('permissions')
                    .where('id', permission.id)
                    .del()
            )));
        });
};
