
exports.up = function(knex) {
    return knex.schema.alterTable('files', function(table) {
        table.date('valid_date_from');
        table.date('valid_date_to');
        table.dropColumn('expired_at');
    })
        .then(function () {
            return knex.schema.alterTable('draft_files', function(table) {
                table.date('valid_date_from');
                table.date('valid_date_to');
            });
        })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE files ADD CONSTRAINT check_valid_dates CHECK (valid_date_from < valid_date_to)'),
                knex.raw('ALTER TABLE draft_files ADD CONSTRAINT check_valid_dates CHECK (valid_date_from < valid_date_to)'),
            ]);
        });
};

exports.down = function(knex) {
    return Promise.all([
        knex.raw('ALTER TABLE files DROP CONSTRAINT check_valid_dates'),
        knex.raw('ALTER TABLE draft_files DROP CONSTRAINT check_valid_dates')
    ])
        .then(function () {
            return knex.schema.alterTable('files', function(table) {
                table.dropColumn('valid_date_from');
                table.dropColumn('valid_date_to');
                table.timestamp('expired_at');
            });
        })
        .then(function () {
            return knex.schema.alterTable('draft_files', function(table) {
                table.dropColumn('valid_date_from');
                table.dropColumn('valid_date_to');
            });
        });
};
