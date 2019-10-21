
const PERMISSIONS = [
    {
        id: '04742577-c2dd-4460-a7dc-d8bac4f010ac',
        name: 'authorization'
    },
    {
        id: 'da15a5f5-904b-4a0d-9296-902d874e5b81',
        name: 'finish_registration',
    },
    {
        id: '06525222-d6a7-4472-9163-a9f8537e5d5c',
        name: 'reset_password',
    },
    {
        id: '7d8d5f12-7cc1-4b68-b458-0b025e9f65fb',
        name: 'confirm_email',
    },
    {
        id: 'ec6a6f1e-2bb7-408b-bb3b-7ecb847abe8a',
        name: 'confirm_phone_number',
    }
];

exports.PERMISSIONS = PERMISSIONS;

exports.up = function(knex) {
    return knex.schema.createTable('permissions', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').unique().notNull();
        table.text('description');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('permissions', PERMISSIONS);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('permissions');
};
