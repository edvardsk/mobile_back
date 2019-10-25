const { ROLES } = require('./20191017143230_add_roles');
const { PERMISSIONS } = require('./20191017144540_add_permissions');
const { getRolesToPermissionsForDb } = require('../app/formatters/system');

const ROLES_WITH_PERMISSIONS = [
    ['unconfirmed_transporter', [
        'confirm_email',
    ]],
    ['unconfirmed_holder', [
        'confirm_email',
    ]],
    ['unconfirmed_individual_forwarder', [
        'confirm_email',
    ]],
    ['unconfirmed_sole_proprietor_forwarder', [
        'confirm_email',
    ]],

    ['confirmed_email_transporter', [
        'authorization',
        'reset_password',
        'confirm_phone_number',
    ]],
    ['confirmed_email_holder', [
        'authorization',
        'reset_password',
        'confirm_phone_number',
    ]],
    ['confirmed_email_individual_forwarder', [
        'authorization',
        'reset_password',
        'confirm_phone_number',
    ]],
    ['confirmed_email_sole_proprietor_forwarder', [
        'authorization',
        'reset_password',
        'confirm_phone_number',
    ]],

    ['confirmed_email_and_phone_transporter', [
        'authorization',
        'reset_password',
        'finish_registration',
    ]],
    ['confirmed_email_and_phone_holder', [
        'authorization',
        'reset_password',
        'finish_registration',
    ]],
    ['confirmed_email_and_phone_individual_forwarder', [
        'authorization',
        'reset_password',
        'finish_registration',
    ]],
    ['confirmed_email_and_phone_sole_proprietor_forwarder', [
        'authorization',
        'reset_password',
        'finish_registration',
    ]],

    ['transporter', [
        'authorization',
        'reset_password',
    ]],
    ['holder', [
        'authorization',
        'reset_password',
    ]],
    ['individual_forwarder', [
        'authorization',
        'reset_password',
    ]],
    ['sole_proprietor_forwarder', [
        'authorization',
        'reset_password',
    ]],
];

exports.up = function(knex) {
    return knex.schema.createTable('roles_to_permissions', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('role_id').references('roles.id').notNull();
        table.uuid('permission_id').references('permissions.id').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['role_id', 'permission_id']);
    })
        .then(function () {
            return knex.batchInsert('roles_to_permissions', getRolesToPermissionsForDb(ROLES, PERMISSIONS, ROLES_WITH_PERMISSIONS));
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('roles_to_permissions');
};
