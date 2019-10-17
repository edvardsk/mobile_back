
const ROLES = [
    {
        id: '2cb98849-9ffc-447b-9db8-89904e5eacd9',
        name: 'unconfirmed_transporter',
    },
    {
        id: '841cd2ca-ebe3-469c-a224-19e8a58f9512',
        name: 'unconfirmed_holder',
    },
    {
        id: '5919296a-beb7-4762-ae51-f205b4bcbf45',
        name: 'unconfirmed_individual_forwarder',
    },
    {
        id: '54e996b9-b187-48d7-9e32-0d393e883c74',
        name: 'unconfirmed_sole_proprietor_forwarder',
    },

    {
        id: '22a0c6af-28a2-4046-a0d7-3355c41f4e45',
        name: 'confirmed_email_transporter',
    },
    {
        id: 'e387a182-9efc-450d-93d2-e11d5bf66efd',
        name: 'confirmed_email_holder',
    },
    {
        id: 'fdfd5a35-8398-4163-bce4-d6aaf07be9d1',
        name: 'confirmed_email_individual_forwarder',
    },
    {
        id: '9d4ac0a4-d93c-46b0-a346-b62f1c35b06c',
        name: 'confirmed_email_sole_proprietor_forwarder',
    },
    {
        id: '72ff977b-12c3-4669-a796-3db3144c93ac',
        name: 'confirmed_email_and_phone_transporter',
    },
    {
        id: '99009b3d-6257-4e2b-8e73-105a07991209',
        name: 'confirmed_email_and_phone_holder',
    },
    {
        id: '33235346-08c5-487b-a5e3-e80b3c6db647',
        name: 'confirmed_email_and_phone_individual_forwarder',
    },
    {
        id: '86193922-29d2-4008-ba96-ecc3fcce8e85',
        name: 'confirmed_email_and_phone_sole_proprietor_forwarder',
    },
    {
        id: 'cdf57c6a-094f-473d-ad5b-d207ec332541',
        name: 'transporter',
    },
    {
        id: 'c33a7f3c-0858-4597-a6c1-15c70d026545',
        name: 'holder',
    },
    {
        id: '1b40fb5f-63b4-468c-bb13-eae9a2a21d78',
        name: 'individual_forwarder',
    },
    {
        id: '8a33237d-e93f-4c5e-a257-796edc6a0c9b',
        name: 'sole_proprietor_forwarder'
    }
];

exports.ROLES = ROLES;

exports.up = function(knex) {
    return knex.schema.createTable('roles', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name').unique().notNull();
        table.text('description');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.batchInsert('roles', ROLES);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('roles');
};
