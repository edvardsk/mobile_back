
exports.up = function(knex) {
    return knex.schema.createTable('phone_confirmation_codes', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('user_id').references('users.id');
        table.string('code', 6).notNull();
        table.timestamp('expired_at').defaultTo(knex.fn.now());
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE phone_confirmation_codes ADD CONSTRAINT check_code CHECK (code ~ \'^[0-9]+$\')'),
                knex.raw('ALTER TABLE phone_confirmation_codes ADD CONSTRAINT checkExpiredAt CHECK (expired_at >= created_at)')
            ]);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('phone_confirmation_codes');
};
