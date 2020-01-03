
exports.up = function(knex) {
    return knex.schema.createTable('deal_points_info', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.uuid('deal_id').references('deals.id').notNull();
        table.uuid('cargo_point_id').references('cargo_points.id');
        table.string('point_address').notNull();
        table.string('point_person_full_name').notNull();
        table.string('point_person_full_phone_number').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('deal_points_info');
};
