
exports.up = function(knex) {
    return knex.schema.createTable('draft_drivers', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('driver_id').references('drivers.id').notNull();
        table.string('email').notNull();
        table.string('full_name').notNull();
        table.uuid('phone_prefix_id').references('phone_prefixes.id').notNull();
        table.string('number', 10).notNull();
        table.timestamp('driver_licence_registered_at').notNull();
        table.timestamp('driver_licence_expired_at').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.string('passport_number').notNull();
        table.string('passport_personal_id').notNull();
        table.string('passport_issuing_authority').notNull();
        table.date('passport_created_at').notNull();
        table.date('passport_expired_at').notNull();
        table.specificType('comments', 'text[]').defaultTo('{}');
        table.unique('driver_id');
    })
        .then(function () {
            return knex.schema.createTable('draft_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.string('name').notNull();
                table.text('url').notNull();
                table.specificType('labels', 'text[]').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        })
        .then(function () {
            return knex.schema.createTable('draft_drivers_to_files', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('draft_driver_id').references('draft_drivers.id').notNull();
                table.uuid('draft_file_id').references('draft_files.id').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique(['draft_driver_id', 'draft_file_id']);
            });
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('draft_drivers_to_files')
        .then(function () {
            return knex.schema.dropTable('draft_files');
        })
        .then(function () {
            return knex.schema.dropTable('draft_drivers');
        });
};
