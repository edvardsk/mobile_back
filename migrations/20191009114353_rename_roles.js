const { getRolesForDb, getPermissionsForDb, getRolesToPermissionsForDb, getFileLabelsForDb } = require('../app/formatters/system');

exports.up = function(knex) {
    return knex.transaction(function(t) {
        return knex('email_confirmation_hashes')
            .transacting(t)
            .delete()
            .then(function() {
                return knex('forgot_password')
                    .delete();
            })
            .then(function() {
                return knex('roles_to_permissions')
                    .delete();
            })
            .then(function() {
                return knex('users_to_roles')
                    .delete();
            })
            .then(function() {
                return knex('users_to_files')
                    .delete();
            })
            .then(function() {
                return knex('files_to_file_labels')
                    .delete();
            })
            .then(function() {
                return knex('file_labels')
                    .delete();
            })
            .then(function() {
                return knex('files')
                    .delete();
            })
            .then(function() {
                return knex('permissions')
                    .delete();
            })
            .then(function() {
                return knex('roles')
                    .delete();
            })
            .then(function() {
                return knex('companies')
                    .delete();
            })
            .then(function() {
                return knex('users')
                    .delete();
            })
            .then(t.commit)
            .catch(function() {
                t.rollback();
            });
    })
        .then(function () {
            return knex.batchInsert('roles', getRolesForDb());
        })
        .then(function () {
            return knex.batchInsert('permissions', getPermissionsForDb());
        })
        .then(function () {
            return knex.batchInsert('roles_to_permissions', getRolesToPermissionsForDb());
        })
        .then(function () {
            return knex.batchInsert('file_labels', getFileLabelsForDb());
        });
};

exports.down = function(knex) {
    return knex.transaction(function(t) {
        return knex('email_confirmation_hashes')
            .transacting(t)
            .delete()
            .then(function() {
                return knex('forgot_password')
                    .delete();
            })
            .then(function() {
                return knex('roles_to_permissions')
                    .delete();
            })
            .then(function() {
                return knex('users_to_roles')
                    .delete();
            })
            .then(function() {
                return knex('users_to_files')
                    .delete();
            })
            .then(function() {
                return knex('files_to_file_labels')
                    .delete();
            })
            .then(function() {
                return knex('file_labels')
                    .delete();
            })
            .then(function() {
                return knex('files')
                    .delete();
            })
            .then(function() {
                return knex('permissions')
                    .delete();
            })
            .then(function() {
                return knex('roles')
                    .delete();
            })
            .then(function() {
                return knex('companies')
                    .delete();
            })
            .then(function() {
                return knex('users')
                    .delete();
            })
            .then(t.commit)
            .catch(function() {
                t.rollback();
            });
    })
        .then(function () {
            return knex.batchInsert('roles', getRolesForDb());
        })
        .then(function () {
            return knex.batchInsert('permissions', getPermissionsForDb());
        })
        .then(function () {
            return knex.batchInsert('roles_to_permissions', getRolesToPermissionsForDb());
        })
        .then(function () {
            return knex.batchInsert('file_labels', getFileLabelsForDb());
        });
};
